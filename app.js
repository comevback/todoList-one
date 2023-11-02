import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.MongoURL).then(console.log("Successfully Connected to the MongoDB!"));
const todoSchema = new mongoose.Schema({
    context: String
});
//模版

const listSchema = new mongoose.Schema({
    name: String,
    items: [todoSchema]
});
//创建List的模版

const todolist = mongoose.model("todolist", todoSchema); //范例
const List = mongoose.model("List", listSchema);//这是通过List模版，创建database里的一个List。

let items = await todolist.find({}, { context:1 });
let now = new Date().toLocaleDateString(undefined,{ weekday: 'long' , year: 'numeric' , month: 'long' , day: 'numeric'
});


app.get("/", (req, res) => {
    res.render("index.ejs", {
        title: now,
        items: items
    });
});

//await todolist.deleteMany({_id:{$gt:3}});

app.post("/add", async(req, res) => {
    const input = req.body.input; 
    const listname = req.body.listName;
    const newItem = new todolist({
        context: input
    })
    //实例
    if(listname === now){
        todolist.insertMany([newItem])
        .then(console.log(`New item (${input}) was added.`));
        items = await todolist.find({}, { context: 1 });
        console.log(`now the to-do-list has ${items.length} items.`)
        res.redirect("/");
    }else{
        List.findOne({name:listname})
        .then((foundList) => {
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listname);
        })
        .catch((err) => {
            console.log(err);
        })
    }
});

app.post("/delete", async(req, res) => {
    const checkedItemId = req.body.checkbox;
    const listname = req.body.listName;
    console.log(checkedItemId);

    if(listname === now){
        todolist.findByIdAndRemove(checkedItemId)
        .then(
            console.log(`Item (${checkedItemId}) was deleted from todolist.`)
        )
        .catch((err) => {
            console.log(err);
        });
        items = await todolist.find({}, { _id: 1, context: 1 });
        console.log(`now the to-do-list has ${items.length} items.`)
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name: listname}, {$pull:{items:{_id: checkedItemId}}}) // use $pull to delete item from items of lists.
        .catch((err) => {
            console.log(err);
        })
        res.redirect("/" + listname);
    }
    // another way:
    // todolist.deleteOne({_id: checkedItemId})
    // .then(console.log(`Item (${checkedItemId}) was deleted.`))
    // .catch((err) => {
    //      console.log(err);
    //  });
});

app.get("/:customList", async(req, res) => {
    const customList = req.params.customList;
    
    try{
        const foundList = await List.findOne({name: customList});
        if(!foundList){
            const list = new List({
                name: customList,
                items: []
            })
            //List.insertMany([collect]).then(console.log(`New list (${collect}) was added to List`));
            await list.save();
            console.log("New list was added to List:", list);
            res.redirect("/" + customList);
        }else{
        res.render("index.ejs", {
            title: foundList.name,
            items: foundList.items
        });
        }
    }catch(err){
        console.log(err);
    }
});
  

app.listen(port, ()=> {
    console.log(`Server is listening on port ${port}.`);
});

