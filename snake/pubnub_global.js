/**
 * Written for UTSC New Media in Theory
 * Parts of this code is adapted from Nick Puckett & Kate Hartman's Creation & Computation PubNub Code
 * 
 * This file sets up the publish and subscribe events for the all of the pubnub pages on this website.  
*/

let dataServer;
let pubKey = "pub-c-2bc7201c-7663-426c-b55e-94182384a19e";
let subKey = "sub-c-dbb0efc4-b3c8-49e5-9ca3-7235d1f08f96";
let secretKey = "sec-c-NTIxZTllYzktZTlkOS00NzdmLTg2YzEtM2EwOWEyNTBjMTM2";

function createServer(name) {
  dataServer = new PubNub({
    subscribeKey: subKey,
    publishKey: pubKey,
    uuid: name,
    secretKey: secretKey,
    heartbeatInterval: 0,
  });

}