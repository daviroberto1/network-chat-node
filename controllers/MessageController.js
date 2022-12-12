const Message = require('../models/Message');
const User = require('../models/User');

module.exports = class MessageController{ 
    static async showMessages(req,res) {
        
        const messagesData = await Message.findAll({
            include: [User],
            
        });
         const messages = messagesData.map((result) =>
        result.get({ plain: true })
      );
      for (let i = 0; i < messages.length; i++) {
        messages[i].createdAt = messages[i].createdAt.getHours() + ":" + (messages[i].createdAt.getMinutes())
      }
        res.render('chat/home', {messages})
    }

    static async messagePost(req,res) {
        const message = req.body.message;
       
        if(!req.session.userid) {
            res.redirect('/login')
        }
        try {
            await Message.create({message: message, UserId: req.session.userid})
            res.redirect('/')
        }catch(err){
            console.log(err)
        }
    }
}