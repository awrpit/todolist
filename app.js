const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb+srv://admin-arpit:arpits2002@cluster0.w4ze6.mongodb.net/todolistDB", { useNewUrlParser: true});

const itemsSchema = {
  name: String
}
const Item = new mongoose.model("Item", itemsSchema);
app.set("view engine", "ejs");

const itemOne = new Item({
  name: "Food"
})
const itemTwo = new Item({
  name: "Books"
})

const itemThree = new Item({
  name: "Eat"
})
const defaultItems = [itemOne, itemTwo, itemThree];

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List", listSchema)

app.get("/", function (req, res){
  Item.find({}, (err, toDoItems) => {
    if (toDoItems.length === 0){
      Item.insertMany(defaultItems, err => {
        if (!err) {
           console.log("Successfully Added");
        }
          res.redirect("/");
      })
    }
    else { res.render("index", {listTitle: "Today", listItems: toDoItems})}
  })
})

 app.post("/", function (req, res){
  const newItem = req.body.newItem;
  const listName = req.body.listName;
  const item = new Item({
    name: newItem
   })

   if (listName === "Today") {
     item.save();
     res.redirect("/");
   } else {
     List.findOne({name: listName}, (err, foundList) => {
       foundList.items.push(item);
       foundList.save();
       res.redirect("/" + listName);
     })
   }
 
 })

 app.post("/delete", function (req, res){
   const title = req.body.list;
   const itemChecked = req.body.checkbox;
   console.log(title);
   console.log(itemChecked);
   if (title === "Today") {
    Item.findByIdAndRemove(itemChecked, err =>
      {
        if (!err) {console.log("success")}
        res.redirect("/");
      })
      
    } else {
     List.findOneAndUpdate({name: title}, {$pull: {items: {_id: itemChecked}}}, (err, result) => {
       if (!err){
         res.redirect("/" + title);
       }
     })
    }
   
 })

app.get("/:newList", function (req, res){
  String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  };
  const customListName = req.params.newList.toProperCase()
  List.findOne({name: customListName}, function(err, foundList){ 
       if(!err) {
         if (!foundList) {
           // Create a new list 
           const list = new List({
            name: customListName,
            items: defaultItems
          })
          list.save();
          res.redirect("/" + customListName);
         } else {
           //  show existing list
         res.render("index", {listTitle: foundList.name, listItems: foundList.items})
         }
       }
  })
})

app.listen(3000, function (){
  console.log("The server is live");
})