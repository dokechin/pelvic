const arrayShuffle = require('array-shuffle')
const uuid = require('uuid').v4
const _ = require('lodash')
const { DOMAIN, ExtensionId, DEBUG ,BOT_ACCESS_TOKEN, DB_PASSWORD} = require('../config')
var verifier = require('../util/verifier.js')
const PUBLIC= "./public/clova";

class Directive {
  constructor({namespace, name, payload}) {
    this.header = {
      messageId: uuid(),
      namespace: namespace,
      name: name,
    }
    this.payload = payload
  }
}

class CEKRequest {
  constructor (httpReq) {
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session
  
    console.log(`CEK Request: ${JSON.stringify(this.context)}, ${JSON.stringify(this.session)}`)
  }

  do(cekResponse) {
    switch (this.request.type) {
      case 'LaunchRequest':
        return this.launchRequest(cekResponse)
      case 'IntentRequest':
        return this.intentRequest(cekResponse);
      case 'SessionEndedRequest':
        return this.sessionEndedRequest(cekResponse)
    }
  }

  launchRequest(cekResponse) {
    cekResponse.appendSpeechText({
      lang: 'ja',
      type: 'URL',
      value: `${DOMAIN}/drum-japanese2.mp3`
    })
  }
  
  intentRequest(cekResponse) {
    switch (intent) {
      case 'RepeatIntent':
        cekResponse.appendSpeechText({
          lang: 'ja',
          type: 'URL',
          value: `${DOMAIN}/info-girl1_info-girl1-youi1.mp3`
        })          
        break;
      case 'Clova.GuideIntent': 
      default: 
        cekResponse.appendSpeechText("もう一度と指示してください。")
    }
  }
}

class CEKResponse {
  constructor () {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {}
    }
    this.version = '0.1.0'
    this.sessionAttributes = {}
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
  }

  setSimpleSpeechText(outputText, lang = 'ja') {
    this.response.outputSpeech = {
      type: 'SimpleSpeech',
      values: {
          type: 'PlainText',
          lang: lang,
          value: outputText,
      },
    }
  }

  appendSpeechText(outputText) {
    const outputSpeech = this.response.outputSpeech
    if (outputSpeech.type != 'SpeechList') {
      outputSpeech.type = 'SpeechList'
      outputSpeech.values = []
    }
    if (typeof(outputText) == 'string') {
      outputSpeech.values.push({
        type: 'PlainText',
        lang: 'ja',
        value: outputText,
      })
    } else {
      outputSpeech.values.push(outputText)
    }
  }
}

const clovaReq = function (httpReq, httpRes, next) {
  const signature = httpReq.headers.signaturecek
  var cekResponse = new CEKResponse()
  var cekRequest = new CEKRequest(httpReq)
  if (!DEBUG) {
    try {
      verifier(signature, ExtensionId, JSON.stringify(httpReq.body))
    } catch (e) {
      return httpRes.status(400).send(e.message)
    }
  }
  cekRequest.do(cekResponse)
  console.log(`CEKResponse: ${JSON.stringify(cekResponse)}`)
  return httpRes.send(cekResponse)
};

module.exports = clovaReq;
