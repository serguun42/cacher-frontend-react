import { Component } from "react";
import "./App.css";

export default class App extends Component {
	render() {
		return (
			<div className="app" data-some-val="123">
				<p className="app__paragraph">
					Lorem ipsum dolor sit amet consectetur, adipisicing elit.
					Fuga, corporis! Inventore ipsa natus aperiam repudiandae
					quibusdam explicabo iste. Officia tempora ipsam odio
					molestiae vero sapiente neque esse asperiores nostrum
					accusamus.
				</p>
			</div>
		);
	}
}
