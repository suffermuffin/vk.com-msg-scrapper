// ==UserScript==
// @name          msg_parser-vk.com
// @namespace     Messages Parser For Vk.com
// @match         https://vk.com/im
// @match         https://vk.com/im?sel=*
// @grant         GM_listValues
// @grant         GM_setValue
// @grant         GM_getValue
// @run-at        document-end
// @version       1.0
// @author        suffermuffin
// @description   23.08.2023, 17:23:42
// ==/UserScript==

const forbiddenChats = ['https://vk.com/im?sel=000000', 'https://vk.com/im?sel=111111'] // Personal chats, that won't be parsed
const separator = '⍼' // Separator that will be used for generating CSV file
const startingChat = 0 // First chat to parse from above
const chatNum = 10 // Number of chats to be parsed
const msgDepth = 5 // How deep into chat should program parse
const scrollAwaitTime = 1000  // Timeout between scrolls, might be useful if internet connection is weak
const scrollRetryAttempts = 4 // Number of checks before calling "Reached Top of Chat" state


class vkParser{

  constructor(chatNum, msgDepth){

    this.chatNum = chatNum;
    this.msgDepth = msgDepth;
    this.msId = 0;
    this.chatWin = document.getElementsByClassName("ui_scroll_outer")[2];
    this.pplWin = document.getElementsByClassName("ui_scroll_outer")[1];

  }

  /** Makes 1 scroll to (0,0) coordinates, before the coordinate grip updates */
  async scroll(){

    const pr = new Promise((resolve, reject) => {


        setTimeout(() => {
        if (this.chatWin.scrollTop === 0) {resolve(true);}
        this.chatWin.scroll(0, 0);

        resolve(false);
        reject(true);
      },
                   scrollAwaitTime)
    })
    return pr
  }


  /** Iteration over number of scrolls */
  async scroller(){
    let confirmTop = 0

    for (let i = 0; i <= this.msgDepth; i++){
      if (await this.scroll()){
        confirmTop++;
        i--;
        console.log('Page might been not loaded, confirming (' + confirmTop + '/' +  scrollRetryAttempts + ')')
      }
      else {
        console.log("Scroll depth", i);
        confirmTop = 0
      }
      if (confirmTop === scrollRetryAttempts) {console.log('Reached the top of conversation'); break;}
    }
  }


  /** Cheks validation of URL */
  async checkUrl(){
  const pr = new Promise((resolve, reject) =>{
    setTimeout(() => {
      if
        (
        !document.URL.includes('https://vk.com/im?sel=c') &&
        !(forbiddenChats.includes(document.URL))
        )
      {
        resolve(true)
        reject(this.checkUrl())
      }
      else {
        console.log("Group or personal chat encountered => skipping");
        resolve(false)
        reject(this.checkUrl())
      }
    }, 1000)
  })
  return pr
}

  /** Scraping each message body */
  scrapeTxt(){
    const elements = document.getElementsByClassName("im-mess-stack _im_mess_stack ")
    let count = 0

      for (let elem of elements)
      {
        let txt = ''
        let txtNode = elem.getElementsByClassName("im-mess--text wall_module _im_log_body")

        txtNode.forEach(nod =>
          {
          for (let childNode of nod.childNodes)
            {
            if (childNode.nodeName.includes('#text') && !(childNode.data === ""))
              {
                txt = txt + childNode.data.charAt(0).toUpperCase() + childNode.data.replaceAll('\n', '. ').slice(1) + '. '
              }
            }
          })

        if (!(txt === "" || elem.dataset.peer == 0)){
          GM_setValue(this.msId, this.msId + separator + elem.dataset.peer + separator + txt.slice(0, -2));
          this.msId += 1;
          count++;
        }


    }
    console.log('Extracted', count, 'messages')
  }

  /** Scrolling left window, containing all chats until desired number of chats were loaded */
  async pplDepth(scrollLength){
    const pr = new Promise((resolve, reject) => {
      setTimeout(() => {

        this.pplWin.scroll(0, scrollLength);
        const chatList = document.getElementsByClassName("nim-dialog");

        resolve(chatList)
        reject(this.pplDepth())

      }, 600)
    })

    return pr
  }

  /** Main function */
  async parse(){

    let chatList = document.getElementsByClassName("nim-dialog");
    let scrollLength = 0

    while(chatList.length <= this.chatNum){
      scrollLength += 1000
      chatList = await this.pplDepth(scrollLength)
    }

    chatList = Array.from(chatList).slice(0, this.chatNum)

    for (let [index, chat] of chatList.slice(startingChat).entries()){
      chat.click()
      let valid = await this.checkUrl()
      if (valid === true) {
        await this.scroller()
        .then(() => this.scrapeTxt())
      }
      console.log("CHAT №", '(' + index + '/' + chatNum + ')')
    }
  }
}


function main(){
  const m = new vkParser(chatNum, msgDepth)
  m.parse()
}


function getArray(){
  let arrayOfKeys = GM_listValues()
  let csvArray = []
  for (let i of arrayOfKeys) {
    if (!((GM_getValue(i) == 0) || (GM_getValue(i)) == "")){
      csvArray.push([GM_getValue(i)])
    }
  }

  return csvArray
}


function getCsv(){
  const arr = getArray();
  // let csvContent = "data:text/csv;charset=utf-8,index" + separator + "user_id" + separator + "text\n";
  let csvContent = "index" + separator + "user_id" + separator + "text\n";

  arr.forEach(function(rowArray) {
    let row = rowArray;
    csvContent += row + "\n";
  })

  console.log(arr.length)

  // var encodedUri = encodeURI(csvContent);

  var encodedUri = encodeURIComponent(csvContent)
  const dataUri = `data:text/csv;charset=utf-8,${encodedUri}`;
  // console.log(dataUri);
  window.open(dataUri);


}

const isExec = confirm('Execute parser?')
if (isExec){ main() }

else {
  const isCsv = confirm('Download parsed dataset?')
  if (isCsv){ getCsv() } }


setTimeout(() => {
  const ad = document.getElementById("ads_left");
  ad.remove();
}, 600)
