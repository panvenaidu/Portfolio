import assert from 'node:assert/strict';
import {readdirSync,readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,dirname,extname} from 'node:path';
const root=resolve('dist');
const files=[resolve(root,'index.html'),resolve(root,'scrollcraft.html'),...readdirSync(resolve(root,'projects')).filter(f=>f.endsWith('.html')).map(f=>resolve(root,'projects',f))];
const pages=new Map(files.map(file=>[file,readFileSync(file,'utf8')]));
let count=0;
for(const [file,html] of pages){
  assert.equal((html.match(/<h1\b/g)||[]).length,1,`${file}: one h1`);
  assert.match(html,/<html lang="en"/);
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    const url=match[1];if(/^(?:https?:|mailto:|data:)/.test(url))continue;
    const [pathname,fragment]=url.split('#');const path=pathname.split('?')[0];
    const local=path?resolve(url.startsWith('/')?root:dirname(file),url.startsWith('/')?path.slice(1):path):file;
    assert.ok(existsSync(local),`${file}: missing ${url}`);count++;
    if(fragment&&local.endsWith('.html'))assert.ok(readFileSync(local,'utf8').includes(`id="${fragment}"`),`${file}: missing destination ${url}`);
  }
  assert.ok(!html.includes('theme.js'),'No legacy theme runtime');
}
const main=pages.get(files[0]);
const alias=pages.get(resolve(root,'scrollcraft.html'));
assert.ok(alias.includes('location.replace("/"'),'Previous review URL redirects to the only portfolio');
assert.ok(existsSync(resolve(root,'Panvee_Naidu_Resume.pdf')));
for(const id of ['room-home','room-systems','room-aerochat','room-home-automation','room-pkcs11','room-valorix','room-crowd','room-aurum','room-softsell','room-record','room-credentials','room-contact'])assert.ok(main.includes(`id="${id}"`),`Missing Workroom destination ${id}`);
assert.equal((main.match(/href="\/Certs\//g)||[]).length,8);
for(const fact of JSON.parse(readFileSync('scrollcraft/builds/workroom/FACTS.json','utf8')).projects){assert.ok(main.includes(fact.title),`Missing project ${fact.title}`);assert.ok(main.includes(fact.source),`Missing source ${fact.title}`);}
for(const html of pages.values())for(const retired of ['?core=', 'core-canvas', 'core-poster', 'core-companion', 'core-story', 'studio.css', 'atlas.css', 'editorial.css'])assert.ok(!html.includes(retired),`Retired preview exposed: ${retired}`);
assert.ok(!main.includes('—'),'No em dashes in homepage');
const pkg=JSON.parse(readFileSync('package.json','utf8'));
for(const dependency of ['three','lenis','gsap','locomotive-scroll','animejs'])assert.ok(!pkg.dependencies?.[dependency],`Removed animation dependency remains: ${dependency}`);
for(const name of readdirSync(resolve(root,'assets')))if(extname(name)==='.js')assert.ok(statSync(resolve(root,'assets',name)).size<650000,`Oversized JavaScript bundle: ${name}`);
console.log(`PASS: ${files.length} pages, ${count} local file/fragment references, 7 projects, 8 credentials, résumé, sole Workroom homepage and bundle budgets.`);
