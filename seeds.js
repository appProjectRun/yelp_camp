var mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment");


seeds = [
    {
        name: "My first camp",
        image: "https://www.photosforclass.com/download/pb_5767334",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer molestie sem vitae finibus faucibus. Donec efficitur ac nisi non elementum. Nunc vehicula egestas blandit. Aenean nec congue sapien. Sed dui ante, ullamcorper at erat et, commodo blandit dolor. Praesent eu mi erat. Quisque quis nisl id lectus imperdiet lobortis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Mauris at iaculis ex. Ut rhoncus scelerisque eleifend. Cras et mauris in nulla egestas lacinia. Aenean sem diam, dignissim ut rhoncus ut, commodo eu nulla. Pellentesque hendrerit lacus quam, sed mollis lorem varius ut."
    },
    {
        name: "My second camp",
        image: "https://www.photosforclass.com/download/pb_3336579",
        description: "Quisque id rhoncus risus, et hendrerit lacus. Pellentesque condimentum nulla eget ultrices fringilla. Praesent dictum pharetra aliquet. Morbi et neque risus. Morbi vehicula risus sem, eu euismod felis commodo at. Nunc finibus vel mi sed ultrices. Aenean quis sodales elit, eu vehicula arcu. Fusce finibus aliquam quam, id venenatis metus tristique eu. Sed vel congue tortor. Donec ornare ipsum sit amet sem auctor viverra. Morbi pretium purus ex, ac malesuada nulla fermentum ac. Suspendisse facilisis nisl elit, ac consectetur tellus tincidunt in. Vestibulum dapibus enim maximus molestie vehicula. Nam pharetra commodo ipsum, at lacinia quam malesuada blandit. Quisque vel suscipit justo. Fusce vitae mauris hendrerit, gravida ipsum sit amet, bibendum metus."
    },
    {
        name: "My third camp",
        image: "https://www.photosforclass.com/download/pb_1995961",
        description: "Duis sit amet magna bibendum, semper urna eu, imperdiet ligula. Sed tempor ex non varius gravida. Nunc hendrerit sit amet nunc sed cursus. Donec egestas vehicula arcu in placerat. Praesent vulputate enim a orci maximus consequat. Vestibulum consequat, tellus id pretium blandit, nisi dui viverra ante, nec elementum lorem nulla ac arcu. Cras augue neque, sagittis vitae lorem eu, scelerisque eleifend odio. Fusce rhoncus, nibh a molestie varius, mauris nisi vulputate velit, quis cursus eros lectus vitae tellus. Sed id tincidunt libero. Cras non erat non ante lacinia bibendum in in massa. Nunc sed arcu mattis, eleifend enim in, viverra ex. Etiam accumsan, justo ut vulputate efficitur, tellus ipsum varius est, ac tristique quam nisi non enim. Nulla commodo quam vitae magna molestie sodales. Fusce condimentum, libero at tincidunt interdum, nisi sapien facilisis elit, vel facilisis nulla sapien at sem. Vivamus non neque in dui ullamcorper commodo."
    },
    {
        name: "My fourth camp",
        image: "https://www.photosforclass.com/download/pb_1813100",
        description: "Curabitur posuere est at magna luctus, non eleifend elit pharetra. Vivamus vitae auctor augue. Etiam massa sapien, convallis eu dapibus quis, pretium at nibh. Sed et tempus libero, ac pulvinar nunc. Etiam maximus vitae tellus sagittis pulvinar. Donec tempor dictum quam sit amet lobortis. Nam sit amet pellentesque mauris, quis ullamcorper nulla. Donec gravida iaculis purus vitae cursus. Sed risus nisi, lobortis eu gravida eleifend, scelerisque ac quam. Nunc convallis sem in viverra porta. Aliquam erat volutpat. Proin nunc diam, porttitor ac pellentesque ac, accumsan nec enim. Morbi dapibus magna ac felis viverra rutrum. Curabitur iaculis consectetur velit, eget consectetur libero condimentum vel. Suspendisse dictum non enim a fermentum."
    }

]

// function seedDB() {
//     Comment.remove({}, function (err) {
//         if (err) {
//             console.log(err);
//         } else {
//             Campground.remove({}, function (err) {
//                 if (err)
//                     console.log(err);
//                 else {
//                     console.log("all campgrounds removed");
//                     Data.forEach(function (seed) {
//                         Campground.create(seed, function (err, seedData) {
//                             if (err)
//                                 console.log(err);
//                             else {
//                                 console.log("Campground created");
//                                 Comment.create(
//                                     {
//                                         text: "hello campground",
//                                         author: "suwish"
//                                     }
//                                     , function (err, comment) {
//                                         if (err)
//                                             console.log(err);
//                                         else {
//                                             console.log("Comment created");
//                                             seedData.comments.push(comment);
//                                             seedData.save();
//                                         }
//                                     });
//                             }
//                         });
//                     });
//                 }
//             });
//         }
//     });
// }

async function seedDB() {
    try {
        await Campground.remove({});
        console.log("campgrounds were removed.");
        await Comment.remove({});   
        console.log("comments were removed.");     
        // for(const seed of seeds){
        //     var campground = await Campground.create(seed);
        //     console.log("campground was created.");
        //     var comment = await Comment.create({ text: "hello campground", author: "suwish" });
        //     console.log("comment was created.");
        //     await campground.comments.push(comment);
        //     console.log("comment was pushed into the campground.");
        //     await campground.save();
        //     console.log("campground was saved with comment.");
        // } 
    } catch (err) {
        if(err){
            console.log(err);
        }
    }
}

module.exports = seedDB;
