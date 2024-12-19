
import { setUserInfo, clearUserInfo } from '@/store/slices/userInfoSlice';

function addQueryParam(url, paramName, paramValue) {
    const urlObj = new URL(url);
    if (paramValue !== null && paramValue !== undefined) {
        urlObj.searchParams.append(paramName, paramValue);
    }

    return urlObj.toString();
}

async function apiRequest(url, options = {}) {
    const store = (await import('@/store/store')).default;
    const sessionToken = localStorage.getItem("Apitoken");
    let consumerStored = 0;
    let sessionStoredID = 0;
    if (sessionToken) {
        try {

            const decodedToken = atob(decodeURIComponent(sessionToken));
            const sessionData = JSON.parse(decodedToken);

            const { sessionId, expires, consumer } = sessionData;
            consumerStored = consumer;
            sessionStoredID = sessionId;

            const currentTime = new Date().getTime() / 1000;
            if (expires < currentTime) {
                alert("Expired session");
                store.dispatch(clearUserInfo());
                localStorage.removeItem('Apitoken');
                location.reload();
            }
        } catch (error) {
            console.error("Error decoding session token:", error);
            alert("Invalid session token");
            localStorage.removeItem('Apitoken');
        }
    }


    const headers = new Headers(options.headers || {});
    const fetchOptions = {
        method: options.method || "GET",
        headers: headers,
        body: options.body || null,
        credentials: options.credentials || "same-origin",
        ...options,

    };
    try {

        let urlWithToken = sessionToken ? addQueryParam(url, 'apitoken', sessionToken) : addQueryParam(url, 'apitoken', "refresh");

        let response = await fetch(urlWithToken, fetchOptions);
        let responseBody = null;

        try {
            responseBody = await response.json();
            response.json = () => {
                return responseBody;
            }
            if (responseBody && responseBody.loggedIn !== undefined) {
                // console.log('Logged in:', responseBody.loggedIn);
                store.dispatch(setUserInfo({ loggedIn: responseBody.loggedIn }));

                // Save user info in localStorage
                localStorage.setItem('userInfo', JSON.stringify({ loggedIn: responseBody.loggedIn }));
            }

            let sessionTokenEncoded = response.headers.get("Apitoken");

            let nonce = response.headers.get("nonce");


            let decodedToken = atob(decodeURIComponent(sessionTokenEncoded));

            let sessionData = JSON.parse(decodedToken);

            if (sessionStoredID !== sessionData.sessionId || consumerStored == 0) {

                // Sign the session with public key, happens only once per session, and stored in the current app/machine
                consumerStored = await generateHashWithPublicKey(sessionData.signKey);

                consumerStored = await generateHash(sessionData.sessionId, consumerStored);


            }

            console.log(consumerStored)
            sessionData.consumer = consumerStored;
            sessionData.nonce = nonce;
            sessionData = JSON.stringify(sessionData);
            sessionData = btoa(sessionData);
            if (sessionData) {
                localStorage.setItem("Apitoken", sessionData);
            }

        } catch {
            return response;
        }

        return response;
    } catch (error) {
        console.error("Error in apiRequest:", error);
        throw error;
    }
}

async function generateHashWithPublicKey(signingKey) {

    // Concatenate the API_PUBLIC_KEY and signingKey
    const publicKey = import.meta.env.VITE_PUBLIC_KEY;

    const dataToHash = publicKey + signingKey;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}
async function generateHash(token, secretKey) {
    // Concatenate the token and secretKey as done in PHP
    const dataToHash = token + secretKey;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}
export default apiRequest