var data = {
  BMP: '53,lc-33,p3,w3-4,13l-18,14v,14x-1,150-1,153,174-a,18r-u,19s,1cm-6,1cv-5,1d3-1,1d6-3,1dc-9,1e9,1f4-q,1ie-a,1j4-9,1kb-8,1li-3,1ln-8,1lx-2,1m1-4,1nd-2,1r8-q,1s0-3,1tm-2,1tq-h,1u9-6,1uq-1,1uu-9,1vl-2,1x8,1xa-6,1xj-1,1xn-2,1xz,1ya-1,1ye-9,1z5-2,20s,20u-4,213-1,217-2,21d,21y-b,22d,22p-2,24c,24e-7,24n-2,24r-2,25e-1,25i-9,269-2,27w,27y-6,287-1,28b-2,28m-1,28y-1,292-9,29u,2bi-4,2bq-2,2bu-3,2c7,2cm-9,2dd-2,2f2-6,2fa-2,2fe-3,2fp-1,2g2-1,2g6-9,2gy-1,2ik,2im-6,2iu-2,2iy-3,2j9-1,2jm-1,2jq-9,2ki-1,2m6-6,2me-2,2mi-3,2mv,2n6-1,2na-9,2o2-1,2q2,2q7-5,2qe,2qg-7,2r6-1,2sx,2t0-6,2tj-7,2ts-9,2wh,2wk-5,2wr-1,2x4-5,2xc-9,2zc-1,2zk-9,305,307,309,30e-1,31t-j,32e-1,32l-a,32x-z,346,36z-j,37k-9,386-3,38e-2,38i-2,38n-6,38x-3,39e-b,39r-e,3tp-2,3u1-8,4k2-2,4ky-2,4lu-1,4mq-1,4ok-v,4pp,4ps-9,4qz-2,4r4-9,4vd,4yo-b,4z4-b,4zq-9,52o-g,53c-1,53k-a,55j-4,579-9,57k-s,58f-a,58w-9,5c0-4,5dg-g,5e8-9,5ez-8,5fk-2,5gh-c,5gw-9,5ie-d,5k4-j,5kw-9,5lc-9,5ow-2,5p0-k,5pp,5pu-2,5vk-12,5x8-3,6bw-1,6db-1,6dw,6hc-c,6ht,6hx-b,8vj-2,8zj,928-v,9ii-5,9ll-1,wtc-9,wvj,wvo-9,wwv,wz4-1,x6q,x6u,x6z,x7n-4,xa8-1,xbo-g,xcg-9,xcw-h,xds-9,xeu-7,xfr-c,xhc-3,xir-d,xjk-9,xm1-d,xmr,xn0-1,xn4-9,xob,xps,xpu-2,xpz-1,xq6-1,xq9,xrf-4,xrp-1,xyb-7,xyk-1,xyo-9,1dlq,1e68-f,1e74-6,1e7n-1,1e8d-2,1eds-9,1ef3',
  astral: '1eyl,1fhc-9,1gjl-2,1gjp-1,1gjw-3,1gl4-2,1glb,1hq8-2,1hrs-e,1ht2-9,1hts-2,1hv4-a,1hww-9,1hxc-2,1hyf-d,1hyu-9,1i0w-2,1i2b-d,1i34-9,1j1n-c,1j28-9,20k1-19,20lr-3,2jxh-4,2jxp-5,2jy3-7,2jyd-6,2jze-3,2k3m-2,2l72-1d,jo5c-6n'
};
function toArray(data) {
  var result = [];
  data.split(',').forEach(function (ch) {
    var range = ch.split('-');
    if (range.length === 1) {
      result.push(parseInt(ch, 36));
    } else {
      var from = parseInt(range[0], 36);
      var to = from + parseInt(range[1], 36);
      while (from <= to) {
        result.push(from);
        from++;
      }
    }
  });
  return result;
}
exports.BMP = toArray(data.BMP);
exports.astral = toArray(data.astral);