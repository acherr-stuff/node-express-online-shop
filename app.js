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

/**
 * задаем шаблонизатор
 */
app.set('view engine', 'pug')

/**
 * подключаем модуль, который позволит подсоединяться к БД
 */

let mysql = require('mysql');

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
  // console.log('loading /');
  //render - метод для загрузки файла на сервер и отображения в браузере
  con.query(
    'SELECT * FROM goods',
    function(error, result) {
      //если ловим ошибку, выбрасывается исключение, которое остановит программу и выведет ошибки в консоль
      if (error) throw err;
      // console.log(result);

      let goods = {};
      for (let i = 0; i < result.length; i++) {
        goods[result[i]['id']] = result[i];
      }
      // console.log(goods);
      console.log(JSON.parse(JSON.stringify(goods)));
        res.render("main", {
          foo: "hello",
          bar: 7,
          goods : JSON.parse(JSON.stringify(goods))
        });
    }
  );

});

app.get('/catalog', function (req, res) {
    res.end('CATALOG');
});

