import axios from 'axios' 


const url = 'http://localhost:7800/api'

export async function getOtp(phoneNumber){
    const res = await axios.get(`${url}/otp/${phoneNumber}`)
    return res.data
}

export async function validateOtp(phoneNumber, code){
    const res = await axios.post(`${url}/otp/${phoneNumber}`, {code})
    return res.data
}