const { Fido2Lib } = require("fido2-lib");
const express = require('express')
const cors = require('cors')
const bodyparser = require('body-parser')
const base64url = require('base64url');
const generateDBConnection = require('./src/external/dbConn')
const UserSchema = require('./models/userMetadata')
const mongoose = require('mongoose')

const app = express()
app.use(cors())
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())
app.use(bodyparser.raw({type: 'application/octet-stream'}))

mongoose.connect("mongodb+srv://gunjan:7999797002@passwordlessauth.ukm2zte.mongodb.net/passwordlessUserDatabase?retryWrites=true&w=majority")
    const connection = mongoose.connection
    connection.on('open', () => {
        console.log('connected to mongodb')
    })

var credOptions = new Fido2Lib({
    challengeSize: 128,
    rpId: "localhost",
    rpName: "dummy server",
    attestation: "none",
    cryptoParams: [-7, -257],
    authenticatorAttachment: "cross-platform",
    authenticatorRequireResidentKey: true,
    authenticatorUserVerification: "required",
    timeout: 600000
})

const changeArrayBufferToArray = (arrayBufferObj) => {
    return Array.from(new Uint8Array(arrayBufferObj))
}

var challenge;
// var publicKey;
// var counter;

// var userID = '123'

const insertRegisterDataInDB = async (counter, publicKey, userID) => {
    const userData = {
        counter: counter,
        publicKey: publicKey,
    }
    let updatedAndInsertedUserDataInDB = await UserSchema.findOneAndUpdate({_id: "1"}, userData)
}

const fetchUserDataFromDB = async () => {
    const fetchedResponseFromDB = await UserSchema.find({_id: '1'})
    return fetchedResponseFromDB
}

app.post('/requestGetMakeCredentialOptions', async (req, res) => {
    const userDataFromDB = await fetchUserDataFromDB()
    const fetchedUserIDFromDB = await userDataFromDB[0].userID
    const registrationOptions = await credOptions.attestationOptions()
    registrationOptions.user = {}
    registrationOptions.user.name = 'gunjan'
    registrationOptions.user.displayName = 'gunjan'
    registrationOptions.user.id = fetchedUserIDFromDB
    challenge = registrationOptions.challenge
    registrationOptions.challenge = changeArrayBufferToArray(registrationOptions.challenge)
    res.send(registrationOptions)
})

app.post('/verifyRegisterCredentials', async (req, res) => {
    const credentialsToVerify = req.body
    // console.log('credential attestation -------> ', CredentialAttestation.from(credentialsToVerify))
    var attestationExpectations = {
        challenge: challenge,
        origin: 'http://localhost:3000',
        factor: "either"
    };

    const arrayBuffer = new Uint8Array(credentialsToVerify.response.clientDataJSON).buffer
    const utf8Decoder = new TextDecoder('utf-8');
    const decodedClientData = JSON.parse(utf8Decoder.decode(arrayBuffer))
    credentialsToVerify.rawId = new Uint8Array(credentialsToVerify.rawId).buffer
    credentialsToVerify.response.attestationObject = new Uint8Array(credentialsToVerify.response.attestationObject).buffer
    credentialsToVerify.response.clientDataJSON = new Uint8Array(credentialsToVerify.response.clientDataJSON).buffer
    var regResult = await credOptions.attestationResult(credentialsToVerify, attestationExpectations)

    // console.log("registration result -------> ", regResult)
    
    publicKey = regResult.authnrData.get("credentialPublicKeyPem")
    counter = regResult.authnrData.get("counter")
    insertRegisterDataInDB(counter, publicKey)
})

app.post('/requestGetAuthenticateCredentialOptions', async (req, res) => {
    const authOptions = await credOptions.assertionOptions()
    challenge = authOptions.challenge
    authOptions.challenge = changeArrayBufferToArray(authOptions.challenge)
    res.send(authOptions)
})

app.post('/verifyauthcredentials', async (req, res) => {
    const credentialsToVerify = req.body

    const userDataFromDB = await fetchUserDataFromDB()
    const fetchedPublicKeyFromDB = await userDataFromDB[0].publicKey
    const fetchedCounterFromDB = await userDataFromDB[0].counter
    const fetchedUserIDFromDB = await userDataFromDB[0].userID
    const assertionExpectations = {
        challenge: challenge,
        origin: "http://localhost:3000",
        factor: "either",
        publicKey: fetchedPublicKeyFromDB,
        prevCounter: parseInt(fetchedCounterFromDB),
        userHandle: base64url(fetchedUserIDFromDB)
    }
    
    credentialsToVerify.rawId = new Uint8Array(credentialsToVerify.rawId).buffer
    credentialsToVerify.response.authenticatorData = new Uint8Array(credentialsToVerify.response.authenticatorData).buffer
    credentialsToVerify.response.clientDataJSON = new Uint8Array(credentialsToVerify.response.clientDataJSON).buffer
    credentialsToVerify.response.signature = new Uint8Array(credentialsToVerify.response.signature).buffer
    credentialsToVerify.response.userHandle = new Uint8Array(credentialsToVerify.response.userHandle).buffer

    var authnResult = await credOptions.assertionResult(credentialsToVerify, assertionExpectations); // will throw on error
    console.log('authnResult ------> ', authnResult)
})

app.listen(8000, () => {
    console.log('server is listening to port 8000')
})