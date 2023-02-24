import React, { useState } from 'react'
import {Buffer} from 'buffer';
import { Link } from 'react-router-dom';
import '../css/pages.css'

function Login() {
    const [userName, setUserName] = useState('')

    const handleChange = (e) => {
        setUserName(e.target.value)
    }

    const changeArrayBufferToArray = (arrayBufferObj) => {
        return Array.from(new Uint8Array(arrayBufferObj))    
    }

    const handleClick = async (e) => {
        e.preventDefault()
        const requestGetAuthenticateCredentialOptionsResponse = await fetch('http://localhost:8000/requestGetAuthenticateCredentialOptions', {
            method: "POST",
            headers: {"Content-Type": 'application/json'},
            body: JSON.stringify({userName: userName})
        })

        const requestGetAuthenticateCredentialOptionsResponseJSON = await requestGetAuthenticateCredentialOptionsResponse.json()
        requestGetAuthenticateCredentialOptionsResponseJSON.challenge = Buffer.from(requestGetAuthenticateCredentialOptionsResponseJSON.challenge)
        console.log(requestGetAuthenticateCredentialOptionsResponseJSON)

        navigator.credentials.get({
            publicKey: requestGetAuthenticateCredentialOptionsResponseJSON
        }).then(res=> {
            console.log(res)

//             const utf8Decoder = new TextDecoder('utf-8');
// const decodedClientData = utf8Decoder.decode(
//     res.response.userHandle)

//     const clientDataObj = JSON.parse(decodedClientData);

// console.log('clientDataObj: --> ', clientDataObj)

            const jsonObj = {}
            jsonObj.rawId = changeArrayBufferToArray(res.rawId)
            jsonObj.response = {}
            jsonObj.response.authenticatorData = changeArrayBufferToArray(res.response.authenticatorData)
            jsonObj.response.clientDataJSON = changeArrayBufferToArray(res.response.clientDataJSON)
            jsonObj.response.signature = changeArrayBufferToArray(res.response.signature)
            jsonObj.response.userHandle = changeArrayBufferToArray(res.response.userHandle)
            console.log('jsonObj -----> ', jsonObj)

            
            
            return fetch('http://localhost:8000/verifyauthcredentials', {
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
        <button className='button' onClick={handleClick}>Login</button>
      </form>
      Not Registered to this <b>AWESOME</b> Service yet!<Link to='/register'>Register Here</Link>
    </div>
  )
}

export default Login
