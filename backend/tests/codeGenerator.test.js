import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMeetingCode, normalizeMeetingCode } from '../src/utils/codeGenerator.js';

test('generateMeetingCode generates a 3-4-3 format string', () => {
    const code = generateMeetingCode();
    assert.match(code, /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/);
});

test('normalizeMeetingCode cleans and normalizes strings', () => {
    assert.equal(normalizeMeetingCode('  ABC-defg-HIJ  '), 'abc-defg-hij');
    assert.equal(normalizeMeetingCode('Room!@#$123'), 'room123');
    assert.equal(normalizeMeetingCode(''), '');
});

