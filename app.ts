import express from "express";
const app = express();
import flash from "express-flash";
import session from "express-session"
import { engine } from "express-handlebars";
import dotenv from "dotenv";
import axios from "axios";

// config

        // Session
        app.use(
            session({
                secret: 'suuuu',
                resave: true,
                saveUninitialized: true
            })
        );

        // Dotenv
        dotenv.config();

        // Flash
        app.use(flash());

        // Globals
        app.use((req, res, next) => {
            res.locals.successMsg = req.flash('successMsg');
            res.locals.errorMsg = req.flash('errorMsg');
            next();
        });

        // Handlebars
        app.engine('handlebars', engine({
            defaultLayout: 'main' // in views/layouts
        }));
        app.set('view engine', 'handlebars');
        app.set('views', './views');





// render the interface
app.get('/', (req, res) => {

    const { convertedAmount } = req.query;

    res.render('converter.handlebars', { convertedAmount: convertedAmount || 0.00
    })
})

// create the request and response
app.get('/converter-request', async (req, res) => {

    const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
    const BASE_URL = "https://v6.exchangerate-api.com/v6/"

    const { amount, from, to } = req.query;

    
    console.log(req.query)
    console.log(`${amount}, ${from}, ${to}`)

    // if some data is missing. 
    if(!amount || !from || !to) {
        req.flash("errorMsg", "Invalid parameters.");
        return res.redirect('/');
    }

        try {
            // creating the full URL with the request
            const url = `${BASE_URL}${API_KEY}/latest/${from}`;

            // making the request
            const response = await axios.get(url)

            // changed IF parameters
            if(!response.data || !response.data.conversion_rates[String(to)]) {
                req.flash("errorMsg", "Currency not found.");
                return res.redirect('/');
            }

            const rate = response.data.conversion_rates[String(to)];

            // Make the conversion
            const convertedAmount = (Number(amount) * rate).toFixed(2)

            // Using query parameter
            res.redirect(`/?convertedAmount=${convertedAmount}`)

        } catch (err) {
            req.flash("errorMsg", `There was an error searching the data: ${err}`);
        };
})


app.listen(8088, () => {
    console.log('Server running in the PORT: 8088')
})