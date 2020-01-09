import React, { useState, useEffect } from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

const IndexPage = () => {
  // let's hold price in state to ensure component will re-render, whenever we change price
  const [price, setPrice] = useState()

  // useEffect ensures we won't be trying using websocket when generating static html
  useEffect(() => {
    const websocket = new WebSocket("wss://ws.bitstamp.net")
    websocket.addEventListener(`message`, event => {
      // some sanity checks if everything is defined
      if (!event || !event.data) {
        return
      }

      // data is object in string representation, so we need to parse it to get actual
      // object that we can grab price from.
      const parsedEvent = JSON.parse(event.data)

      // we only care about `trade` events. There is plenty of other potential events we might receive,
      // so it's good idea to check what kind of event we have here
      if (parsedEvent.event === `trade`) {
        setPrice(parsedEvent.data.price)
      }
    })
    // subscribe to channel once connection is opened
    websocket.addEventListener(`open`, () => {
      websocket.send(
        JSON.stringify({
          event: "bts:subscribe",
          data: {
            // probably not currency you are interested in (BTC<->USD) - just when I was trying it out
            // eur didn't seem to trade (? don't know anything about bitcoin :) )
            // or maybe I was just using wrong channel name
            channel: "live_trades_btcusd",
          },
        })
      )
    })

    // cleanup - when this component will unmount - we want to close the websocket connection:
    return () => {
      websocket.close()
    }
  }, [])

  return (
    <Layout>
      <SEO title="Home" />
      <h1>Hi people</h1>
      <p>Welcome to your new Gatsby site.</p>
      <p>Now go build something great.</p>
      <p>Bitcoin Price: {price}</p>
      <div
        style={{
          maxWidth: `300px`,
          marginBottom: `1.45rem`,
        }}
      >
        <Image />
      </div>
      <Link to="/page-2/">Go to page 2</Link>
    </Layout>
  )
}

export default IndexPage
