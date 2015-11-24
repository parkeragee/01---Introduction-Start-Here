var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');

var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Navigation = ReactRouter.Navigation;
var History = ReactRouter.History;
var createBrowserHistory = require('history/lib/createBrowserHistory');

var h = require('./helpers');


/*
 * App
 */
var App = React.createClass({

	getInitialState: function() {
		return {
			fishes: {},
			order: {}
		}
	},

	addToOrder: function(key) {
		this.state.order[key] = this.state.order[key] + 1 || 1;
		this.setState({order: this.state.order});
	},

	addFish: function(fish) {
		var timestamp = (new Date()).getTime();
		//update state
		this.state.fishes['fish-' + timestamp] = fish;
		console.log(this.state.fishes);
		//set state
		this.setState({ fishes : this.state.fishes });
	},

	loadSamples: function() {
		this.setState({
			fishes: require('./sample-fishes')
		});
	},

	renderFish: function(key) {
		return <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder} />
	},

	render: function() {
		return (
			<div className="catch-of-the-day">
				<div className="menu">
					<Header tagline="Fresh seafood market" />
					<ul className="list-of-fishes">
						{Object.keys(this.state.fishes).map(this.renderFish)}
					</ul>
				</div>
				<Order fishes={this.state.fishes} order={this.state.order} />
				<Inventory addFish={this.addFish} loadSamples={this.loadSamples} />
			</div>
		)
	}
});

/*
 * Fish
 * <Fish />
 */
var Fish = React.createClass({

	onButtonClick: function() {
		this.props.addToOrder(this.props.index);
	},

	render: function() {
		var details = this.props.details;
		var isAvailable = (details.status === 'available' ? true : false);
		var buttonText = (isAvailable ? 'Add to Order' : 'Sold Out!');
		return (
			<li className="menu-fish">
				<img src={details.image} alt={details.name} />
				<h3 className="fish-name">
					{details.name}
					<span className="price">{h.formatPrice(details.price)}</span>
				</h3>
				<p>{details.description}</p>
				<button disabled={!isAvailable} onClick={this.onButtonClick}>{buttonText}</button>
			</li>
		)
	}
});

/*
 * Add Fish Form
 * <AddFishForm />
 */
var AddFishForm = React.createClass({

	createFish: function(event) {
		// Stop form from submitting
		event.preventDefault();
		// Take the data from the form and create object
		var fish = {
			name: this.refs.name.value,
			price: this.refs.price.value,
			status: this.refs.status.value,
			desc: this.refs.desc.value,
			image: this.refs.image.value
		}
		
		// Add fish to the App state
		this.props.addFish(fish);
		this.refs.fishForm.reset();
	},

	render: function() {
		return (
			<div>
				<form className="fish-edit" ref="fishForm" onSubmit={this.createFish}>
					<input type="text" ref="name" placeholder="Fish name" />
					<input type="text" ref="price" placeholder="Fish price" />
					<select ref="status">
						<option value="available">Fresh!</option>
						<option value="unavailable">Sold out!</option>
					</select>
					<textarea type="text" ref="desc" placeholder="Desc"></textarea>
					<input type="text" ref="image" placeholder="URL to Image" />
					<button type="submit">+ Add Item</button>
				</form>

			</div>
		)
	}
});

/*
 * Header
 */
var Header = React.createClass({

	render: function() {
		return (
			<header className="top">
				<h1>Catch
				<span className="ofThe">
				<span className="of">of</span>
				<span className="the">the</span>
				</span>
				day</h1>
				<h3 className="tagline"><span>{this.props.tagline}</span></h3>
			</header>
		)
	}
});

/*
 * Order
 */
var Order = React.createClass({

	renderOrder: function(key) {
		var fish = this.props.fishes[key];
		var count = this.props.order[key];

		if(!fish) {
			return (
				<li key={key}>Sorry, fish no longer available!</li>
			)
		}
		return (
			<li>
				<span>{count}</span>lbs
				{fish.name}
				<span className="price">{h.formatPrice(count * fish.price)}</span>
			</li>
		)
	},

	render: function() {
		var orderIds = Object.keys(this.props.order);
		var total = orderIds.reduce((prevTotal, key)=> {
			var fish = this.props.fishes[key];
			var count = this.props.order[key];
			var isAvailable = fish && fish.status === 'available';

			if(fish && isAvailable) {
				return prevTotal + (count * parseInt(fish.price) || 0);
			}

			return prevTotal;
		}, 0);
		return (
			<div className="order-wrap">
				<h2 className="order-title">Your order</h2>
				<ul className="order">
					{orderIds.map(this.renderOrder)}
					<li className="total">
						<strong>Total:</strong>
						{h.formatPrice(total)}
					</li>
				</ul>
			</div>
		)
	}
});

/*
 * Inventory
 */
var Inventory = React.createClass({

	render: function() {
		return (
			<div>
				<h2>Inventory</h2>
				<AddFishForm {...this.props} />
				<button onClick={this.props.loadSamples}>Load sample fish</button>
			</div>
		)
	}
});

/*
 * StorePicker
 * This will let us make <StorePicker/>
 */
var StorePicker = React.createClass({

	mixins: [History],

	goToStore: function(event) {
		event.preventDefault();
		// Get data from the input
		var storeId = this.refs.storeId.value;

		// Transition from StorePicker to App
		this.history.pushState(null, '/store/' + storeId);
	},

	render: function() {
		var name = "Parker";
		return (
			<form className="store-selector" onSubmit={this.goToStore}>
				{/*
				 * Create the store
				 */}
				<h2>Please enter a store, {name}</h2>
				<input type="text" ref="storeId" defaultValue={h.getFunName()} required />
				<input type="submit" />
			</form>
		)
	}
});

/*
 * 404 Component
 */
var NotFound = React.createClass({

	render: function() {
		return (
			<h1>404 - Not found!</h1>
		)
	}
});



/*
 * Routes
 */
var routes = (
	<Router history={createBrowserHistory()}>
		<Route path="/" component={StorePicker} />
		<Route path="/store/:storeId" component={App} />
		<Route path="*" component={NotFound} />
	</Router>
)


ReactDOM.render(routes, document.getElementById('main'));