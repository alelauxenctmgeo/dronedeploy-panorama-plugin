window.dronedeploy.ready().then(async (dd) => {
    
    document.getElementById("btnImport").onclick = async () => {
        const fileInput = document.getElementById("fileInput");

        if (!fileInput.files.length) {
            alert("Selecione um arquivo KML primeiro.");
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            const kmlText = event.target.result;

            // Converte KML para GeoJSON
            const geojson = toGeoJSON(kmlText);

            if (!geojson || !geojson.features.length) {
                alert("Nenhum ponto encontrado no KML.");
                return;
            }

            // Prepara camada para DroneDeploy
            const layer = {
                id: "panorama_points",
                type: "geojson",
                features: geojson.features.map(f => ({
                    ...f,
                    properties: {
                        ...f.properties,
                        title: "Panorama 360",
                        altitude: 90,
                        icon: "camera"
                    }
                }))
            };

            await dd.Map.addLayers([layer]);
            alert("Pontos carregados com sucesso!");
        };

        reader.readAsText(file);
    };

});


/* Conversor KML → GeoJSON (simplificado) */
function toGeoJSON(kmlText) {

    const parser = new DOMParser();
    const xml = parser.parseFromString(kmlText, "text/xml");
    const placemarks = xml.getElementsByTagName("Placemark");

    let features = [];

    for (let i = 0; i < placemarks.length; i++) {
        const pm = placemarks[i];
        const coords = pm.getElementsByTagName("coordinates")[0];

        if (!coords) continue;

        const [lon, lat] = coords.textContent.trim().split(",").map(Number);

        features.push({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [lon, lat]
            },
            properties: {
                name: pm.getElementsByTagName("name")[0]?.textContent || "Ponto"
            }
        });
    }

    return { type: "FeatureCollection", features };
}
