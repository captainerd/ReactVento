
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

            const decodedToken = atob(sessionToken);
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

            let decodedToken = atob(sessionTokenEncoded);

            let sessionData = JSON.parse(decodedToken);



            sessionData = JSON.stringify(sessionData);

            if (sessionData) {
                localStorage.setItem("Apitoken", response.headers.get("Apitoken"));
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


export default apiRequest