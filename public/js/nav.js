console.log('nav.js');

document.querySelector(".close-nav").onclick = closeNav;
document.querySelector(".show-nav").onclick = showNav;

function closeNav() {
  document.querySelector(".site-nav").style.left = "-300px";
}
function showNav() {
  document.querySelector(".site-nav").style.left = "0";
}

//получаем список категорий
function getCategoryList() {
    fetch('/get-category-list', 
        {
            method: 'POST'
        }
    ).then(function(response){
        //
        return response.text();
    }
    ).then(function(body){
        console.log(body);
        showCategoryList(JSON.parse(body));
    })
}

function showCategoryList(data) {
    console.log(data);
    let categoryList = document.createElement("ul");
    categoryList.className = "category-list";
    // let out = '<ul class="category-list"><li><a href="/">Main</a></li>';
    for (let i = 0; i < data.length; i++) {
        let li = document.createElement('li');
        let categoryItem = document.createElement("a");
        categoryItem.setAttribute("href", `/cat?id=${data[i]["id"]}`);
        categoryItem.textContent = data[i]["category"];
        li.append(categoryItem);
        categoryList.append(li)
    //   out += `<li><a href="/cat?id=${data[i]["id"]}">${data[i]["category"]}</a></li>`;
    }
    // out += "</ul>";
    // document.querySelector("#category-list").innerHTML = out;
    document.querySelector("#category-list").append(categoryList);
}

getCategoryList();