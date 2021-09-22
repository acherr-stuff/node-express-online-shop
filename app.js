//ЗАПУСК В DEBUG-режиме: 
// set DEBUG=myapp:* & npm start - стандартная команда, взята с сайта
// set DEBUG=express:*  & node app.js - моя команда, изменили после ? потому что пока не прописана команда start
// express - потому что так называется переменная создаваемая ниже, куда подключаем модуль express
// * - значит что будет выводиться вся отладка; & - сцепление команд
// вместо звезодчки можно указать, какие конкретно данные по отладке надо выводить. 
// например, можно записать set DEBUG=express:router  & node app.js; set DEBUG=express:application  & node app.js

let express = require('express');

//новый экземпляр класса express
let app = express();

//подключаем статические файлы

/**
 * public - имя папки, где хранится статика
 */
app.use(express.static('public'))

const nodemailer = require('nodemailer')

/**
 * задаем шаблонизатор
 */
app.set('view engine', 'pug')

/**
 * подключаем модуль, который позволит подсоединяться к БД
 */

let mysql = require('mysql');

app.use(express.json())

/**
 * Чтобы модуль подключился к нужной нам базе, его необходимо настроить
 */

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "market",
});

// console.log('con = ', con)

//запуск сервера
app.listen(3000, function () {
  console.log("node express started on 3000");
});

app.get('/', function(req,res) {
  //render - метод для загрузки файла на сервер и отображения в браузере
  let cat = new Promise(function (resolve, reject) {
    con.query(
      //
      "select * from (select id,name, cost, image, category from (select goods.*, row_number() over (partition by category order by id DESC) i from goods) t where i <= 3) b order by id ASC;",
      function (error, result) {
        if (error) reject(error);
        resolve(result);
      }
    );
  });

  let catDescription = new Promise(function (resolve, reject) {
    con.query("SELECT * FROM category", function (error, result, field) {
      if (error) return reject(error);
      resolve(result);
    });
  });

  Promise.all([cat, catDescription]).then(function (value) {
    console.log(value[0]);
    res.render("index", {
      goods: JSON.parse(JSON.stringify(value[0])),
      cat: JSON.parse(JSON.stringify(value[1])),
    });
  });

});

app.get('/cat', function (req, res) {
    // res.end('CATALOG');
    console.log(req.query.id);
    let catId = req.query.id;

    //создаем промис, чтобы обработать два асинхронных запроса, первый - сама категория с описанием. второй  - товары, принадлежащие данной категории
    let cat = new Promise(function(resolve,reject) {
        con.query(
          "SELECT * FROM category WHERE id=" + catId,
          function (error, result) {
            if (error) reject(error);
            resolve(result);
          }
        );
    });

     let goods = new Promise(function (resolve, reject) {
       con.query(
         "SELECT * FROM goods WHERE category=" + catId,
         function (error, result) {
           if (error) reject(error);
           resolve(result);
         }
       );
     });
    
     //дождемся выполнения обоих промисов с помощью метода Promise.all

     Promise.all([cat,goods]).then(function(value) {
       //value - в нашем случае массив из двух элеменов , 0-й элемент - обозначает разрешение (resolve) первого промиса, 1-й - второго промиса 
       console.log(value[0]);
        res.render("cat", {
          cat: JSON.parse(JSON.stringify(value[0])),
          goods: JSON.parse(JSON.stringify(value[1])),
        });
     })
});

app.get('/goods', function (req, res) {
    // res.end('CATALOG');
    console.log(req.query.id); 
    con.query('SELECT * FROM goods WHERE id='+req.query.id, function (error ,result, fields) {
        if (error) reject(error);
        res.render('goods',{
          goods: JSON.parse(JSON.stringify(result)),
        })
    });
});

app.get("/order", function (req, res) {
  // res.end('CATALOG');
  // console.log(req.query.id);
  // con.query(
  //   "SELECT * FROM goods WHERE id=" + req.query.id,
  //   function (error, result, fields) {
  //     if (error) reject(error);
  //     res.render("goods", {
  //       goods: JSON.parse(JSON.stringify(result)),
  //     });
  //   }
  // );
  res.render('order');
});

//принимаем post-запрос на загрузку названий категорий в меню навигации
app.post("/get-category-list", function (req, res) {
    // console.log(req)
    con.query(
      "SELECT id, category FROM category",
      function (error, result, fields) {
        if (error) throw error;
        console.log(result);
        //данный метод преобразует ответ в json-строку
        res.json(result);
      }
    );
});

app.post("/get-goods-info", function (req, res) {
  console.log(req.body.key);
  if (req.body.key.length != 0) {
     con.query(
       "SELECT id, name, cost FROM goods WHERE id IN (" +
         req.body.key.join(",") +
         ")",
       function (error, result, fields) {
         if (error) throw error;
        //  console.log(result);
         let goods = {};
         for (let i = 0; i < result.length; i++) {
           goods[result[i]["id"]] = result[i];
         }
         //данный метод преобразует ответ в json-строку
         res.json(goods);
       }
     );
  }
   else {
    res.send('{}');
  }
 
});

app.post("/finish-order", function (req, res) {
  console.log(req.body);
  if (req.body.key.length != 0) {
    let key = Object.keys(req.body.key);
    con.query(
      "SELECT id,name,cost FROM goods WHERE id IN (" + key.join(",") + ")",
      function (error, result, fields) {
        if (error) throw error;
        console.log(result);
        sendMail(req.body, result).catch(console.error);
        res.send("1");
      }
    );
  } else {
    res.send("0");
  }
});


async function sendMail(data,result) {
  let res = "<h2>Order in lite shop</h2>";
  let total = 0;
  for (let i = 0; i < result.length; i++) {
    res += `<p>${result[i]["name"]} - ${data.key[result[i]["id"]]} - ${
      result[i]["cost"] * data.key[result[i]["id"]]
    } uah</p>`;
    total += result[i]["cost"] * data.key[result[i]["id"]];
  }

    res += "<hr>";
    res += `Total ${total} uah`;
    res += `<hr>Phone: ${data.phone}`;
    res += `<hr>Username: ${data.username}`;
    res += `<hr>Address: ${data.address}`;
    res += `<hr>Email: ${data.email}`;

    console.log(res);

     let testAccount = await nodemailer.createTestAccount();

     let transporter = nodemailer.createTransport(
       smtpTransport({
         name: "a98",
         host: "smtp.ethereal.email",
         port: 587,
         secure: false, // true for 465, false for other ports
         auth: {
           user: testAccount.user, // generated ethereal user
           pass: testAccount.pass, // generated ethereal password
         },
         tls: {
           rejectUnauthorized: false,
         },
       })
     );

     let mailOption = {
       from: "<andreeva104@gmail.com>",
       to: "andreeva104@gmail.com," + data.email,
       subject: "Lite shop order",
       text: "Hello world",
       html: res,
     };

     let info = await transporter.sendMail(mailOption);
     console.log("MessageSent: %s", info.messageId);
     console.log("PreviewSent: %s", nodemailer.getTestMessageUrl(info));
     return true;

}