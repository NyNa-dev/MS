import Conversation from "../models/conservation.model.js";
import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
   try {
      const { message } = req.body;
      const { id: receiverId } = req.params;
      const senderId = req.user._id;

      let conversation = await Conversation.findOne({
         participants: { $all: [senderId, receiverId] }
      })

      if (!conversation) {
         Conversation =  await Conversation.create({
            participants: [senderId, receiverId],
            // messages: []
         })

         // await newConversation.save();
         // console.log("New conversation created", newConversation);
      }

      // console.log(receiverId, senderId);

      const newMessage = await Message.create({
         senderId,
         receiverId,
         message
      })
      

      // const newMessage = new Message(
      //    {
      //       senderId,
      //       receiverId,
      //       message
      //    }
      // )
      // console.log("New message created", newMessage);
      

      if(newMessage) {
         conversation.messages.push(newMessage._id);
         
         // console.log("Message added to conversation", conversation);
      }

   
      // SOCKET FUNCTIONALITY WILL GO HERE

      // this will save both conversation and message in parallel
      await Promise.all([
         conversation.save(),
         newMessage.save()
      ]);

      res.status(200).json(newMessage);



   } catch (error) {
      console.log("Error in sendMessage controller: ", error.message)
      res.status(500).json({ error: "Internal server error" });

   }
};

export const getMessages = async (req, res) => {
   try {
      const { id: userToChartId} = req.params;
      const senderId = req.user._id;

      const conversation = await Conversation.findOne({
         participants: { $all: [senderId, userToChartId] 
         
      }}).populate("messages"); // REtrieve messages in the conversation

      if (!conversation) {
         return res.status(404).json([]);
      }

      const messages = conversation.messages;


      res.status(200).json(messages);

   } catch (error) {
      console.log("Error in getMessages controller: ", error.message)
      res.status(500).json({ error: "Internal server error" });
   }
};


