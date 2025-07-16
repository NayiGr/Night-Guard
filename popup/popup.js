let websites = localStorage.getItem('websites');
let groups = [];
let currGroup = {};
let url, name, icon, gs, iconInput, currWeb, isOthers = false;
function popup() {
  if (websites) {
    websites = JSON.parse(websites);
    for (let i = 0; i < websites.length; i++) {
      groups = groups.concat({id: websites[i].id, title: websites[i].title});
    }
  } else {
    websites = [];
  }
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    const tab = tabs[0];
    url = document.getElementById('url');
    name = document.getElementById('name');
    icon = document.getElementById('icon');
    gs = document.getElementById('group');
    iconInput = document.getElementById('icon-input');
    url.value = tab.url;
    name.value = tab.title;
    icon.src = tab.favIconUrl;
    iconInput.value = tab.favIconUrl ? tab.favIconUrl : '';
  });
}

function select() {
  const select = document.getElementById('select');
  if (groups.length) {
    groups.forEach(group => {
      const li = document.createElement('li');
      li.setAttribute('id', group.id);
      li.onclick = () => {
        for (const g of groups) {
          if (group.id === g.id) {
            currGroup = Object.assign({}, g);
            gs.value = currGroup.title;
          }
        }
      };
      li.innerText = group.title;
      select.appendChild(li);
    });
  }
  document.addEventListener('DOMContentLoaded', popoverComponent);
}

popup();
select();

function popoverComponent() {
  const more = document.getElementById('more');
  const submit = document.getElementById('submit');
  const image = document.getElementById('image');
  more.addEventListener('click', otherGroup);
  submit.addEventListener('click', submitUp);
  image.addEventListener('change', $event => {
    change($event);
  });
  iconInput = document.getElementById('icon-input');
  icon = document.getElementById('icon');
  iconInput.addEventListener('input', $event => {
    icon.src = $event.target.value;
  });
  if (groups.length) {
    more.style.display = 'block';
  } else {
    more.style.display = 'none';
  }
}

function otherGroup() {
  isOthers = !isOthers;
  const popover = document.getElementById('popover');
  if (isOthers) {
    popover.className = 'show';
  } else {
    popover.className = 'hidden';
  }
}

function submitUp() {
  let isHas = false;
  for (let i = 0; i < websites.length; i++) {
    if (websites[i].id === currGroup.id || websites[i].title === gs.value) {
      isHas = true;
      const web = websites[i].websites;
      let webId = websites[i].id * 1000 + web.length + 1;
      currWeb = {id: webId, name: name.value, icon: iconInput.value, url: url.value};
      if (!web) {
        websites[i].websites = [currWeb];
      } else {
        websites[i].websites = web.concat(currWeb);
      }
    }
  }
  if (!isHas) {
    const groupId = websites[websites.length - 1] ? websites[websites.length - 1].id + 1 : 1;
    websites.push({
      id: groupId,
      title: gs.value,
      websites: [{id: groupId * 1000 + 1, name: name.value, icon: iconInput.value, url: url.value}]
    });
  }
  localStorage.setItem('websites', JSON.stringify(websites));
  window.close();
}

function change(event) {
  const imgFile = new FileReader();
  if (event.target.files[0]) {
    imgFile.readAsDataURL(event.target.files[0]);
    imgFile.onload = (ev) => {
      icon.src = ev.currentTarget.result;
      iconInput.value = ev.currentTarget.result;
    };
  }
}
