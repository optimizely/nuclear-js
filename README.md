Nuclear is a way to model all of your state and business logic in complex systems.

**[Plans for 0.4](./NEXT.md)**

#### TL;DR

- **Flux-like** - One-way data flow, state can only be read, and actions are the only things
that are allowed to change the state of the system

- **Self-managing state** - State objects (**cores**) react to messages passed to them, they are the only ones
that know how to react to that message.  Cores do not know about any

- **UI Agnostic** - Completely abstract all business logic and state into **Cores** and **Actions**.  This makes
the UI layer simply a representation of the state and binds UI events to Nuclear Actions


#### The following prinicples drive its development

- **Immutability** - A means for safety, predictability and performance.

- **Implement functionally** - This reduces state, improves testability and allows composability.

- **Keep state minimal** - build a framework that encourages state of an application to be represented
in the simplest form possible.  Use computeds to transform pure state into something consummable by the
UI layer

- **Convenience APIs** - Provide a framework API that makes building UIs on top of Nuclear seamless and beautiful.

**more documentation coming soon**
