import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const port = 3000;
const mongoUrl = "mongodb://localhost:27017/todoList"

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(mongoUrl).then(console.log("Successfully Connected to the Database!"));
const todoSchema = new mongoose.Schema({
    _id: Number,
    context: String
});
//创建items的模版

// const collectionSchema = new mongoose.Schema({
//     name: String,
//     items: [todoSchema]
// });
//创建collection的模版

const todolist = mongoose.model("todolist", todoSchema); //这是通过items模版，创建collection里的一个items。
//const collection = mongoose.model("collection", collectionSchema);//这是通过collection模版，创建database里的一个collection。

//let todoArr = [];
let items = await todolist.find({}, {_id:0, context:1});

/*item.forEach((item) => {
    todoArr.push(item.context);
});*/
let index = items.length + 1;

app.get("/", (req, res) => {
    res.render("index.ejs", {
        items: items
    });
});

//await todolist.deleteMany({_id:{$gt:3}});

app.post("/add", async(req, res) => {
    const input = req.body.input; 
    const newItem = new todolist({
        _id: index,
        context: input
    })
    index += 1;
    todolist.insertMany([newItem]).then(console.log(`New item (${input}) was added.`));
    items = await todolist.find({}, { _id: 0, context: 1 });
    console.log(`now the to-do-list has ${items.length} items.`)
    res.redirect("/");
});

app.post("/delete", async(req, res) => {
    const checkedItem = req.body.checkbox;
    console.log(checkedItem);
    todolist.deleteOne({context: checkedItem}).then(console.log(`Item (${checkedItem}) was deleted.`));
    items = await todolist.find({}, { _id: 0, context: 1 });
    console.log(`now the to-do-list has ${items.length} items.`)
    res.redirect("/");
});

app.listen(port, ()=> {
    console.log(`Server is listening on port ${port}.`);
});

app.get("/:customList", async(req, res) => {
    const customList = req.params.customList;
    
    
    res.render("index.ejs", {
        items: customitems
    });
})