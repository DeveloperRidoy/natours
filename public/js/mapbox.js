
export const showMap = () => {
  const locations = JSON.parse(document.getElementById('map').getAttribute("data-locations"));
  mapboxgl.accessToken = "pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A";

  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy", // style URL
    scrollZoom: false, //disable scroll
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // create marker
    const el = document.createElement("div");
    el.className = "marker";

    // add the marker
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // add location popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // extend map bound to include current location
    bounds.extend(loc.coordinates);
  });

  // fit the map to the updated bounds
  map.fitBounds(bounds, {
    padding: { top: 200, left: 200, bottom: 150, right: 200 },
  });
}

