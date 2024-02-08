# three-sockets-vite
 
This is a web-sockets with socket.io and three.js using vite build pipeline. 

This makes for a fairly complicated setup, and there are probaly better ways to do it! But here we have our app.js which is an express server with socket.io implemented which will run our built site out of the dist folder. 

We also have our main.js which is our development js file for three.js sketch. During development we need the app.js process running, and we then proxy the vite development server so that it can send and recieve websocket communication through that server. 

 To get started:
  - only the first time on the command line run:
      npm install 
  - open up two terminals. One will run our websockets in app.js, in the first terminal do:
      npm run start
  - Every time you develop / test, it will use the websockets running by the app.js:
      npm run dev
  - To build your static site:
      npm run build
  - The finished site will be run out of the dist folder with:
      npm run start
