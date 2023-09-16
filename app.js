import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const port = 3000;
const mongoUrl = "mongodb://localhost:27017/todoList"

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(mongoUrl).then(console.log("Successfully Connected to the Database!"));
const todoschema = new mongoose.Schema({
    _id: Number,
    context: String
});

const todolist = mongoose.model("todolist", todoschema);
let todoArr = [];
let item = await todolist.find({}, {_id:0, context:1});

item.forEach((item) => {
    todoArr.push(item.context);
});
let index = todoArr.length + 1;

app.get("/", (req, res) => {
    res.render("index.ejs", {
        items: todoArr
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
    todolist.insertMany([newItem]).then(console.log(`new item (${input}) was added.`));
    item = await todolist.find({}, { _id: 0, context: 1 });
    todoArr = item.map((item) => item.context);
    console.log(`now the to-do-list has ${todoArr.length} items.`)
    res.redirect("/");
});

app.delete("/delete", (req, res) => {
    
});

app.listen(port, ()=> {
    console.log(`Server is listening on port ${port}.`);
});