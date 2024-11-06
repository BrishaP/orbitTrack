# SpaceJunk / SkySafe


Sky Safe

Sky Safe is an innovative web app designed to track and visualise space debris in real-time, raising awareness about orbital debris and its impact on satellite safety and space missions. The app offers educational insights, collision risk alerts, orbital predictions, and an interactive 3D view of space, making space debris monitoring accessible to everyone.

License

Sky Safe is open source and distributed under the MIT License. See the LICENSE file for more details.

Authors

Sky Safe is developed by:

	•	Paulina Golebiowska
	•	Brisha Patel
	•	Hamsa Muse
	•	Aiden Isbell

    

Sky Safe empowers users to track and understand space debris, contributing to safer satellite operations and a cleaner orbital environment. 🌌🚀




Table of Contents

	•	Features
	•	Installation
	•	Usage
	•	Technologies
	•	Contributing
	•	License
	•	Authors

Features

Sky Safe includes a range of tools and visualisations to help users understand and explore space debris and its risks:

	1.	Real-Time Tracking
Displays the current positions of space debris and satellites on an interactive 2D/3D map.
	2.	Collision Risk Alerts
Alerts users to potential collisions between debris and operational satellites.
	3.	Orbital Path Predictions
Allows users to view the projected paths of debris over time.
	4.	Size and Velocity Indicators
Provides data on debris size and velocity for context on its potential impact.
	5.	De-Orbit Timeline Estimates
Projects when specific debris pieces are expected to re-enter Earth’s atmosphere.
	6.	Risk Level Indicators
Color-coded markers show the risk level based on debris size, speed, and proximity.
	7.	Educational Tooltips and Pop-Ups
Educates users with facts about space debris and efforts to mitigate it.
	8.	Predictive Cleanup Simulations
Visualizes the potential impact of cleanup missions, such as capturing debris with nets.
	9.	Global Density Heat Map
Shows regions of high debris density for a visual representation of congested orbital zones.
	10.	Interactive 3D Model
Offers a fully interactive 3D model view of space for an immersive experience.

Installation

Follow these steps to set up Sky Safe locally:

1.	Clone the Repository:
git clone https://github.com/your-username/sky-safe.git
cd sky-safe


2.	Install Dependencies:
npm install

3.	Environment Setup:
	•	Obtain an API key from a space tracking service (e.g., Space-Track).
	•	Create a .env file and add your API key:
    REACT_APP_SPACE_API_KEY=your_api_key

4.	Run the App:
npm start


The app will be available at http://localhost:3000.

Usage

After starting Sky Safe, you can:

	•	View Live Debris: Check real-time debris locations and explore their paths.
	•	Filter by Size or Risk: Adjust filters to view specific types of debris based on size, altitude, or velocity.
	•	Receive Collision Alerts: Monitor alerts when potential debris-satellite collisions are detected.
	•	Explore Debris Education: Learn more about each debris piece through tooltips and facts.
	•	Simulate Cleanup Missions: Experiment with cleanup methods in simulation mode.

Technologies

Sky Safe is built with the following technologies:

	•	Frontend: React, Leaflet, Three.js, CesiumJS (for interactive 3D view)
	•	Backend/API: Space-Track API, custom algorithms for collision detection and orbital prediction
	•	Styling: CSS, with light/dark mode support
	•	Data Processing: Node.js (for data fetching and processing), SGP4 library (for orbital mechanics)

Contributing

We welcome contributions to Sky Safe! To contribute:

	1.	Fork the repository.
	2.	Create a new branch for your feature or bugfix:

    git checkout -b feature/YourFeature

    git push origin feature/YourFeature

    5.	Create a pull request describing your changes.

License

Sky Safe is open source and distributed under the MIT License. See the LICENSE file for more details.

Authors

Sky Safe is developed by:

	•	Paulina Golebiowska
	•	Brisha Patel
	•	Hamsa Muse
	•	Aiden Isbell

Sky Safe empowers users to track and understand space debris, contributing to safer satellite operations and a cleaner orbital environment. 🌌🚀
