
function httpGet(theUrl, callback)
{
    if (XMLHttpRequest !== undefined)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        var xmlhttp = new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200)
        {
            let responseText = xmlhttp.responseText;
            callback(responseText);
        }
    }
    xmlhttp.open("GET", theUrl, false );
    xmlhttp.send(); // NS_ERROR_FAILURE is here
}
function httpPost(theUrl, payload, callback)
{
    if (XMLHttpRequest !== undefined)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        var xmlhttp = new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open("POST", theUrl, false );
    xmlhttp.setRequestHeader('Content-type', 'text/html')
    xmlhttp.onreadystatechange = function() {//Call a function when the state changes.
        if(xmlhttp.readyState === 4 && xmlhttp.status === 201) {
            callback(xmlhttp.responseText);
        }
    }

    xmlhttp.send(payload); // NS_ERROR_FAILURE is here
}


self.addEventListener("message", function(event) {
    let args = JSON.parse(event.data);
    fetch(...args).then(function(response) {
        self.postMessage(response);
    }).catch(function (error) {
        self.postMessage(JSON.stringify({error}));
    });
    // let request = JSON.parse(event.data);
    // if(request.method === "GET"){
    //     httpGet(request.url, function(responseText){
    //         self.postMessage(responseText);
    //     });
    // }    else if(request.method === "POST"){
    //     httpPost(request.url, request.payload, function(responseText){
    //         self.postMessage(responseText);
    //     });
    // }
});