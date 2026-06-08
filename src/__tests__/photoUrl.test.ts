import { describe, it, expect } from 'vitest';
import { photoUrl } from '../utils/photoUrl';

describe('photoUrl - XSS protection', () => {
    it('returns null for empty string', () => {
        expect(photoUrl('')).toBeNull();
    });

    it('blocks javascript: URI', () => {
        expect(photoUrl('javascript:alert(1)')).toBeNull();
    });

    it('blocks javascript: URI with uppercase', () => {
        expect(photoUrl('JAVASCRIPT:alert(1)')).toBeNull();
    });

    it('blocks javascript: URI with leading spaces', () => {
        expect(photoUrl('   javascript:alert(1)')).toBeNull();
    });

    it('blocks data: URI', () => {
        expect(photoUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    });

    it('blocks vbscript: URI', () => {
        expect(photoUrl('vbscript:msgbox(1)')).toBeNull();
    });

    it('passes through http URLs unchanged', () => {
        expect(photoUrl('http://example.com/photo.jpg')).toBe('http://example.com/photo.jpg');
    });

    it('passes through https URLs unchanged', () => {
        expect(photoUrl('https://example.com/photo.jpg')).toBe('https://example.com/photo.jpg');
    });

    it('builds full URL from plain filename', () => {
        const result = photoUrl('rose.jpg');
        expect(result).toContain('/photos/rose.jpg');
    });

    it('strips /photos/ prefix and rebuilds URL', () => {
        const result = photoUrl('/photos/rose.jpg');
        expect(result).toContain('/photos/rose.jpg');
        expect(result).not.toContain('/photos//photos/');
    });
});
