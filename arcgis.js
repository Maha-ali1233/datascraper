import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";
import * as geodesicUtils from "@arcgis/core/geometry/support/geodesicUtils.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import Point from "@arcgis/core/geometry/Point.js";

const measureParcel = (e) => {
  var q = [];
  var C = [];
  // _viewerMap.graphics.add(
  //   new esri.Graphic(
  //     e.features[0].geometry,
  //     new o(o.STYLE_NULL, new h(h.STYLE_SOLID, new Y([0, 255, 255]), 2))
  //   )
  // );
  var G = [];
  var _spatialRef; // add this and get rid of this._spatialRef
  if (e.features[0].geometry.rings) {
    var t = e.features[0].geometry;
    _spatialRef = e.features[0].geometry.spatialReference;
    // if (e.features[0].geometry.spatialReference.isWebMercator()) { // I think this is always true
    if (true) {
      // t = D.webMercatorToGeographic(e.features[0].geometry); // D is webMercatorUtils
      t = webMercatorUtils.webMercatorToGeographic(e.features[0].geometry);
      _spatialRef = t.spatialReference;
    }
    // O.forEach(
    //   t.rings,
    //   I.hitch(this, function (T, E) {
    t?.rings?.forEach((T, E) => {
      var L;
      var F;
      var P = 0;
      var H = [];
      var A = [];
      var W = [];
      // O.forEach(
      //   T,
      //   I.hitch(this, function (e, t) {
      T?.forEach((e, t) => {
        var i = false;
        if (t > 0 && t != T.length - 1) {
          var r =
            (Math.atan2(T[t][1] - T[t - 1][1], T[t][0] - T[t - 1][0]) * 180) /
            Math.PI;
          var a =
            (Math.atan2(T[t + 1][1] - T[t][1], T[t + 1][0] - T[t][0]) * 180) /
            Math.PI;
          if (Math.abs(r - a) > 10) {
            i = Math.abs(r - a);
          }
        }
        var s = (E + 10).toString(36).toUpperCase();
        var n = s + H.length.toString();
        // var o = new U(e, _spatialRef); // U is Point
        var o = new Point(e, _spatialRef);
        var h;
        if (F) {
          var l = o.x - F.point.x;
          var f = o.y - F.point.y;
          h = Math.sqrt(l * l + f * f);
          // var p = new k([ // k is Polyline
          var p = new Polyline([
            [o.x, o.y],
            [F.point.x, F.point.y],
          ]);
          if (_spatialRef.wkid == 4326) {
            // p.setSpatialReference(o.spatialReference);
            p.spatialReference = o.spatialReference; // just had to guess this is what it was
            // h = z.geodesicLengths([p], esri.Units.METERS)[0]; // z is geodesicUtils
            // h = geodesicUtils.geodesicLengths([p], esri.Units.METERS)[0];
            h = geodesicUtils.geodesicLengths([p], "meters")[0]; // esri.Units.METERS is a constant evaulating to "meters"
          }
          if (P == 0) {
            A = [];
            W = [];
          }
          A.push(p);
          P += h;
          W.push(P);
        } else {
          L = {
            point: o,
            id: n,
          };
          H.push({
            point: o,
            id: n,
          });
          F = {
            point: o,
            id: n,
          };
          h = 0;
        }
        var d = function (e, t) {
          if (e.spatialReference.wkid) {
            // e = D.geographicToWebMercator(e);
            e = webMercatorUtils.geographicToWebMercator(e);
            // t = D.geographicToWebMercator(t); // D is webMercatorUtils
            t = webMercatorUtils.geographicToWebMercator(t);
          }
          var i = t.y - e.y;
          var r = t.x - e.x;
          var a = i / r;
          var s = ((Math.atan(a) * 180) / Math.PI) * -1;
          return s;
        };
        var u = function (e, t) {
          var i = (e.x + t.x) / 2;
          var r = (e.y + t.y) / 2;
          var a = new Point(i, r, _spatialRef);
          return a;
        };
        var c = function (e, t, i, r, a) {
          var s = {
            x: e * (1 - a) + i * a,
            y: t * (1 - a) + r * a,
          };
          var n = new Point([s.x, s.y], _spatialRef);
          return n;
        };
        if ((i && h > 1) || (i && i > 40) || t == T.length - 1) {
          if (t == T.length - 1) {
            n = L.id;
          }
          C.push(P);
          q.push(
            "<strong>" +
              H[H.length - 1].id +
              "-" +
              n +
              "</strong>: " +
              P.toFixed(2).toString() +
              " " +
              // this.nls.meters +
              " (" +
              (P * 3.28084).toFixed(2).toString() +
              " " +
              // this.nls.feet +
              ")"
          );
          // var v = new esri.symbol.TextSymbol(n);
          // var g = new B();
          // g.setWeight(B.WEIGHT_BOLD);
          // v.setFont(g);
          // v.setHaloColor(new Y([255, 255, 255]));
          // v.setHaloSize(2);
          // var y = new esri.Graphic(o, v);
          H.push({
            point: o,
            id: n,
          });
          // G.push(y);
          if (F) {
            for (var m = 0; m < 2; m++) {
              var S = P.toFixed(2).toString() + " " + "meters"; // this.nls.meters;
              if (m == 1) {
                S = (P * 3.28084).toFixed(2).toString() + " " + "feet"; // this.nls.feet;
              }
              var _;
              var w;
              if (A.length == 1) {
                _ = d(o, F.point);
                w = u(o, H[H.length - 2].point);
              } else {
                var b = P / 2;
                var x;
                var M;
                // O.forEach(
                //   W,
                //   I.hitch(this, function (e, t) {
                //     if (b < e) {
                //       if (W[t - 1]) {
                //         if (b > W[t - 1]) {
                //           x = A[t];
                //           M = b / e;
                //         }
                //       } else {
                //         x = A[t];
                //         M = b / e;
                //       }
                //     }
                //   })
                // );
                // wrote more simply 👇
                W.forEach((e, t) => {
                  if (b < e) {
                    if (W[t - 1]) {
                      if (b > W[t - 1]) {
                        x = A[t];
                        M = b / e;
                      }
                    } else {
                      x = A[t];
                      M = b / e;
                    }
                  }
                });
                w = c(
                  x.paths[0][1][0],
                  x.paths[0][1][1],
                  x.paths[0][0][0],
                  x.paths[0][0][1],
                  M
                );
                _ = d(
                  // new U(x.paths[0][0], _spatialRef),
                  // new U(x.paths[0][1], _spatialRef)
                  new Point(x.paths[0][0], _spatialRef),
                  new Point(x.paths[0][1], _spatialRef)
                );
              }
              var R = 0;
              var j = 0;
              if (_ >= 0 && _ < 45) {
                j = 5;
                if (m == 1) {
                  j = -18;
                }
              } else if (_ > 45) {
                R = 5;
                if (m == 1) {
                  R = -18;
                }
              } else if (_ > -45 && _ < 0) {
                j = 5;
                if (m == 1) {
                  j = -18;
                }
              } else {
                R = -5;
                if (m == 1) {
                  R = 18;
                }
              }
              // var v = new esri.symbol.TextSymbol();
              // v.setText(S);
              // var g = new B();
              // g.setWeight(B.WEIGHT_BOLD);
              // v.setFont(g);
              // v.setOffset(R, j);
              // v.setAngle(_);
              // v.setColor(new Y([180, 0, 0]));
              // v.setHaloColor(new Y([255, 255, 255]));
              // v.setHaloSize(2);
              // _viewerMap.graphics.add(new esri.Graphic(w, v));
            }
            P = 0;
          }
        }
        F = {
          point: o,
          id: n,
        };
      });
    });
  }
  return C;
  // if (q.length > 0) {
  //   var r = C.reduce(function (e, t) {
  //     return e + t;
  //   });
  //   dojo.query("#parcelResults")[0].innerHTML =
  //     "<div style='padding-top:15px'>" + q.join("</div><div>");
  //   dojo.query("#parcelResults")[0].innerHTML +=
  //     "</div><div style='padding-top:15px'><strong>" +
  //     this.nls.totalPerimeter +
  //     "</strong>: " +
  //     r.toFixed(2).toString() +
  //     " " +
  //     this.nls.meters +
  //     " (" +
  //     (r * 3.28084).toFixed(2).toString() +
  //     " " +
  //     this.nls.feet +
  //     ")";
  //   var a = function (e) {
  //     area = 0;
  //     j = e.length - 1;
  //     for (i = 0; i < e.length; i++) {
  //       area = area + (e[j][0] + e[i][0]) * (e[j][1] - e[i][1]);
  //       j = i;
  //     }
  //     return area / 2;
  //   };
  //   var s;
  //   if (e.features[0].attributes["SHAPE.AREA"]) {
  //     s = e.features[0].attributes["SHAPE.AREA"];
  //   }
  //   if (e.features[0].attributes["Shape_Area"]) {
  //     s = e.features[0].attributes["Shape_Area"];
  //   }
  //   dojo.query("#parcelResults")[0].innerHTML +=
  //     "</div><div style='padding-top:15px'><strong>" +
  //     this.nls.totalArea +
  //     "</strong>: " +
  //     s.toFixed(2).toString() +
  //     " " +
  //     this.nls.metersSquared +
  //     " (" +
  //     (s * 10.7639).toFixed(2).toString() +
  //     " " +
  //     this.nls.feetSquared +
  //     ") (" +
  //     (s / 1e4).toFixed(2).toString() +
  //     " " +
  //     this.nls.hectaires +
  //     ")</div>";
  // }
  // O.forEach(
  //   G,
  //   I.hitch(this, function (e) {
  //     _viewerMap.graphics.add(e);
  //   })
  // );
};

async function getParcelGeometry() {
  try {
    const res = await fetch(
      "https://maps.ottawa.ca/proxy/proxy.ashx?https://maps.ottawa.ca/arcgis/rest/services/Property_Information/MapServer/3/query?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=%7B%22xmin%22%3A-8432251.40273713%2C%22ymin%22%3A5683046.9034361085%2C%22xmax%22%3A-8432244.236765727%2C%22ymax%22%3A5683054.069407511%2C%22spatialReference%22%3A%7B%22wkid%22%3A102100%7D%7D&geometryType=esriGeometryEnvelope&inSR=102100&outFields=PIN%2CFULL_ADDRESS_EN%2CPARCEL_TYPE%2CMUNICIPAL_ADDRESS_ID%2COBJECTID%2CADDRESS_NUMBER&outSR=102100&wab_dv=2.5",
      {
        cache: "default",
        credentials: "include",
        headers: {
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
        },
        method: "GET",
        mode: "cors",
        redirect: "follow",
        referrer: "https://maps.ottawa.ca/geoottawa/",
        referrerPolicy: "strict-origin-when-cross-origin",
      }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.log("Error in getParcelGeometry: ", error.message);
  }
}

(async () => {
  const parcelGeometry = await getParcelGeometry();
  console.log(parcelGeometry);
  const measurements = measureParcel(parcelGeometry);
  console.log(measurements);
})();
