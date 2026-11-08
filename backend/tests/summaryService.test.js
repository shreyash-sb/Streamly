import test from 'node:test';
import assert from 'node:assert/strict';
import { generateExtractiveSummary } from '../src/services/summaryService.js';

test('generateExtractiveSummary correctly extracts decisions and actions', () => {
    const transcript = [
        { speaker: 'Alice', text: 'Hello everyone, welcome to the sprint sync.' },
        { speaker: 'Bob', text: 'We decided to prioritize low-bandwidth mode for the initial release.' },
        { speaker: 'Charlie', text: 'I will handle the testing of the STUN and TURN reconnection.' },
    ];

    const result = generateExtractiveSummary(transcript);
    assert.ok(result.overview.length > 0);
    assert.ok(result.keyDecisions.length >= 1);
    assert.match(result.keyDecisions[0], /decided/i);
    assert.ok(result.actionItems.length >= 1);
    assert.equal(result.actionItems[0].owner, 'Charlie');
});

test('generateExtractiveSummary handles empty transcript gracefully', () => {
    const result = generateExtractiveSummary([]);
    assert.equal(result.overview, 'No transcript recorded for this meeting.');
    assert.deepEqual(result.keyDecisions, []);
    assert.deepEqual(result.actionItems, []);
});

