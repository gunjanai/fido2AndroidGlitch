import React, {useState} from 'react'
import {Buffer} from 'buffer';


function Registration() {
    const [userName, setUserName] = useState('')

    const handleChange = (e) => {
        setUserName(e.target.value)
    }

    const changeArrayBufferToArray = (arrayBufferObj) => {
        return Array.from(new Uint8Array(arrayBufferObj))    
    }

    const handleclick = async (e) => {
        e.preventDefault();
        console.log(userName)
        const requestGetMakeCredentialOptionsResponse = await fetch('http://localhost:8000/requestGetMakeCredentialOptions', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userName: userName})
        })

        const requestGetMakeCredentialOptionsResponseJSON = await requestGetMakeCredentialOptionsResponse.json()
        requestGetMakeCredentialOptionsResponseJSON.challenge = Buffer.from(requestGetMakeCredentialOptionsResponseJSON.challenge)
        requestGetMakeCredentialOptionsResponseJSON.user.id = Buffer.from(requestGetMakeCredentialOptionsResponseJSON.user.id)
        console.log(requestGetMakeCredentialOptionsResponseJSON)

        navigator.credentials.create({
            publicKey: requestGetMakeCredentialOptionsResponseJSON
        }).then(res => {
            console.log(res)            

                const jsonObj = {}
                jsonObj.rawId = changeArrayBufferToArray(res.rawId)
                jsonObj.response = {}
                jsonObj.response.attestationObject = changeArrayBufferToArray(res.response.attestationObject)
                jsonObj.response.clientDataJSON = changeArrayBufferToArray(res.response.clientDataJSON)
                console.log(jsonObj)
                
                return fetch('http://localhost:8000/verifyRegisterCredentials', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(jsonObj)
                })
            })
    }
  return (
    <div>
      <form className='form'>
        <input className='form__input' placeholder='Enter your user name' onChange={handleChange} />
        <button onClick={handleclick}>Register</button>
      </form>
    </div>
  )
}

export default Registration
