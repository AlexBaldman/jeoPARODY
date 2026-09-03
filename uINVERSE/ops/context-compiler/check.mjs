import assert from 'node:assert/strict';
import { compileContext, renderPacket } from './compile.mjs';

const graph = {
  nodes: [
    { id: 'world', name: 'World', type: 'world', status: 'active', summary: 'World', source: 'world.md', uses: ['stage'] },
    { id: 'stage', name: 'Stage', type: 'system', status: 'proving', summary: 'Stage', source: 'stage.md', depends_on: ['events'] },
    { id: 'events', name: 'Events', type: 'system', status: 'active', summary: 'Events', source: 'events.md' },
    { id: 'unrelated', name: 'Unrelated', type: 'system', status: 'active', summary: 'Nope', source: 'nope.md' }
  ]
};

const oneHop = compileContext(graph, ['stage'], { depth: 1, maxNodes: 10 });
assert.deepEqual(oneHop.map((node) => node.id), ['stage', 'events', 'world']);
assert(!oneHop.some((node) => node.id === 'unrelated'));

const capped = compileContext(graph, ['stage'], { depth: 2, maxNodes: 2 });
assert.equal(capped.length, 2);

const packet = renderPacket('improve choreography', oneHop);
assert.match(packet, /improve choreography/);
assert.match(packet, /stage\.md/);
assert.doesNotMatch(packet, /nope\.md/);
assert.match(packet, /bounded projection/);

console.log('Context compiler checks passed.');
