//소켓 설정 및 동작 관련 코드
const socketIo = require("socket.io");
let socket;
module.exports = {
  connect: (server) => {
    socket = socketIo(server, {
      cors: {
        origin: ["http://localhost:3000", "http://ked0397.cafe24app.com"],
        methods: ["GET", "POST"],
      },
    });
    return socket;
  },
  getIo: ()=> {return socket}
};
