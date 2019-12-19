async function makeRequest(path, request) {
    const request = await fetch(
        `/game/${path}/${request}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `requestString=${encodeURIComponent(requestString)}`
        }
    );
    if (request.status != 200)
        throw ("Bad Response");
    return await request.json();
}
