// const { default: Swal } = require("sweetalert2");

document.querySelector('#lite-shop-order').onsubmit = function(event) {
    event.preventDefault();
    let username = document.querySelector("#username").value.trim();
    let phone = document.querySelector("#phone").value.trim();
    let email = document.querySelector("#email").value.trim();
    let address = document.querySelector("#address").value.trim();

    if (!document.querySelector('#rule').checked) {
        //не прочел правила
        Swal.fire({
            title: 'Внимание!',
            text: 'Пожалуйста, ознакомьтесь с пользовательским соглашением!',
            type: 'info',
            confirmButtonText: 'OK'
        });
        return false;
    }

    if (username=='' || phone=='' || email=='' || address=='') {
         Swal.fire({
           title: "Внимание!",
           text: "Вы не заполнили необходимые поля в анкете!",
           type: "info",
           confirmButtonText: "OK",
         });
         return false;
    }

    fetch('/finish-order',
        {
            method: 'POST',
            body: JSON.stringify({
                'username': username,
                'phone': phone,
                'email': email,
                'address': address,
                'key': JSON.parse(localStorage.getItem('cart'))
            }),
            headers: {
                'Accept' : 'application/json',
                'Content-Type' : 'application/json'
            }
        }
    )
    .then(function(response) {
        return response.text();
    })
    .then(function(body){
        if (body == 1) {
             Swal.fire({
               title: "Заказ оформлен!",
               text: "success!",
               type: "success",
               confirmButtonText: "OK",
             });
        } else {
            Swal.fire({
              title: "Внимание!",
              text: "Ошибка отправки данных на сервер!",
              type: "error",
              confirmButtonText: "OK",
            });
            return false;
        }
    })
}
