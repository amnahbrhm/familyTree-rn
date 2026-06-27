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

// Full profile payload for a single member (JWT-protected).
export async function getMember(id, token){
    const res = await axios.get(`${url}/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
}

// Whole family graph for the home view: { nodes, edges } (JWT-protected).
export async function getTree(token){
    const res = await axios.get(`${url}/tree`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
}

// --- write endpoints (admin / moderator-in-scope; server-enforced) ----------

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

// Edit scalar fields of a member.
export async function updateMember(id, fields, token){
    const res = await axios.patch(`${url}/members/${id}`, fields, authHeaders(token))
    return res.data
}

// Create a new profile, optionally linked (fatherId/motherId/spouseId/childId).
export async function createMember(payload, token){
    const res = await axios.post(`${url}/members`, payload, authHeaders(token))
    return res.data
}

// Set/replace the mother or father of a child.
export async function setParent(childId, kind, parentId, token){
    const res = await axios.put(`${url}/members/${childId}/${kind}`, { parentId }, authHeaders(token))
    return res.data
}

// Marry a member to a spouse.
export async function addSpouse(id, spouseId, token){
    const res = await axios.post(`${url}/members/${id}/spouse`, { spouseId }, authHeaders(token))
    return res.data
}

// Add an existing person as a child of a member.
export async function addChild(id, childId, token){
    const res = await axios.post(`${url}/members/${id}/children`, { childId }, authHeaders(token))
    return res.data
}

// Unlink the mother or father of a child.
export async function removeParent(childId, kind, token){
    const res = await axios.delete(`${url}/members/${childId}/${kind}`, authHeaders(token))
    return res.data
}

// Remove a marriage between a member and a spouse.
export async function removeSpouse(id, spouseId, token){
    const res = await axios.delete(`${url}/members/${id}/spouse/${spouseId}`, authHeaders(token))
    return res.data
}

// Unlink a child from a member.
export async function removeChild(id, childId, token){
    const res = await axios.delete(`${url}/members/${id}/children/${childId}`, authHeaders(token))
    return res.data
}