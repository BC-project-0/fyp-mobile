import forge from "node-forge"
import { encode as btoa } from "base-64"
// const forge = require('node-forge')

function comput_commitment(id, i, pw, sk) {
    const concatenatedString = `${id}${i}${pw}${sk}`
    const md = forge.md.sha256.create();
    md.update(concatenatedString);
    return md.digest().toHex();
}

function generate_initial_signature(sk, id, yo) {
    const privateKey = forge.pki.privateKeyFromPem(sk)

    if (privateKey === null) {
        throw new Error("Private key password incorrect");
    }
    const concatenatedString = `${id}${yo}`
    const md = forge.md.sha256.create();
    md.update(concatenatedString, "utf8")

    const pss = forge.pss.create({
        md: forge.md.sha256.create(),
        mgf: forge.mgf.mgf1.create(forge.md.sha256.create()),
        saltLength: 20
    })
    const signature = privateKey.sign(md, pss);
    return btoa(signature);
}

function generate_signature(id, xi, yi, i, sk) {
    const privateKey = forge.pki.privateKeyFromPem(sk)

    const concatenatedString = `${id}${xi}${yi}${i}`;
    const md = forge.md.sha256.create();
    md.update(concatenatedString, "utf8")

    const pss = forge.pss.create({
        md: forge.md.sha256.create(),
        mgf: forge.mgf.mgf1.create(forge.md.sha256.create()),
        saltLength: 20
    });
    const signature = privateKey.sign(md, pss);
    return btoa(signature)
}





// module.exports = {
//     comput_commitment, generate_initial_signature, generate_signature
// }
export { comput_commitment, generate_initial_signature, generate_signature }