## Isomorphic Flux Chat Example

This is the Facebook [flux-chat](https://github.com/facebook/flux/tree/master/examples/flux-chat)
example re-written in NuclearJS to demonstate the differences in the libraries as well as to show how Getters are used.

## Running

You must have [npm](https://www.npmjs.org/) installed on your computer.
From the root project directory run these commands from the command line:

`npm install`

This will install all dependencies.

To build the project, first run this command:

`npm run build` it will build the project.

Then run `npm start`. It will run the server on the port 1337, if you want another port use `npm start -- --port=9000` for example.

That's it. The client and server share everything except the entry file which is different for the client (`./js/main.js`) and server (`./server.js`).

Then open a browser and go to `http://localhost:1337` and you can expect the page while disabling javascript =).

Don't hesitate to run `npm run watch` and `npm start` in parallel to hack around.

## Considerations

Do not forget that React.render* functions are synchronous, it's up to the developers to actually make sure that the reactor is already filled before they call the render function.

One could for example make all actions return a promise or be callback based.

Then in the request server side, just wait for the data to be fetched somehow, and then render.
