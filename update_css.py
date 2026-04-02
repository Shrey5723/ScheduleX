import re

with open('css/style.css', 'r') as f:
    css = f.read()

# 1. Update :root
root_new = """:root {
    --color-bg-app: #F0F2F5;
    --color-bg-panel: #FFFFFF;
    --color-bg-surface: #F7F8FA;
    --color-bg-hover: #EEF2FF;

    --color-accent: #4F46E5;
    --color-accent-hover: #4338CA;
    --color-accent-light: #EEF2FF;
    --color-accent-text: #4338CA;

    --color-text-primary: #111827;
    --color-text-secondary: #6B7280;
    --color-text-muted: #9CA3AF;

    --color-border: #E5E7EB;
    --color-border-strong: #D1D5DB;

    --color-success: #059669;
    --color-success-light: #ECFDF5;
    --color-warning: #D97706;
    --color-warning-light: #FFFBEB;
    --color-danger: #DC2626;
    --color-danger-light: #FEF2F2;

    --p-color-0: #6366F1;
    --p-color-1: #10B981;
    --p-color-2: #F59E0B;
    --p-color-3: #EF4444;
    --p-color-4: #8B5CF6;
    --p-color-5: #06B6D4;
    --p-color-6: #F97316;
    --p-color-7: #EC4899;
    --p-color-8: #14B8A6;
    --p-color-9: #84CC16;

    --color-running: var(--color-accent);
    --color-ready: var(--color-success);
    --color-waiting: var(--color-warning);
    --color-completed: var(--color-text-secondary);

    --color-primary: var(--color-accent);
    --color-primary-hover: var(--color-accent-hover);
    --color-primary-light: var(--color-accent-light);
    --color-primary-ghost: rgba(79, 70, 229, 0.08);
    --color-surface: var(--color-bg-panel);
    --color-surface-alt: var(--color-bg-surface);
    --color-border-hover: var(--color-border-strong);
    --color-danger-hover: #B91C1C;
    --color-bg: var(--color-bg-app);

    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;

    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
    --radius-xl: 12px;

    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
    --shadow-md: 0 1px 3px rgba(0, 0, 0, 0.07);
    --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.08);

    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    --font-mono: 'Fira Code', ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;

    --sidebar-left-width: 260px;
    --sidebar-right-width: 280px;
    --header-height: 56px;
}"""
css = re.sub(r':root \{.*?\/\* ===== RESET & BASE ===== \*\/', root_new + '\n\n/* ===== RESET & BASE ===== */', css, flags=re.DOTALL)

# 2. Update html, body
css = re.sub(r'html \{.*?\}', 'html {\n    font-size: 14px;\n    scroll-behavior: smooth;\n    height: 100%;\n    overflow: hidden;\n    margin: 0;\n}', css, flags=re.DOTALL)
css = re.sub(r'body \{.*?\}', 'body {\n    background-color: var(--color-bg-app);\n    color: var(--color-text-primary);\n    font-family: var(--font-sans);\n    line-height: 1.6;\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n    height: 100%;\n    overflow: hidden;\n    margin: 0;\n}', css, flags=re.DOTALL)

# 3. App container
css = re.sub(r'\.app-container \{.*?\}', '.app-container {\n    display: flex;\n    flex-direction: column;\n    height: 100vh;\n    overflow: hidden;\n}', css, flags=re.DOTALL)

# 4. Header redesign & new layout classes padding etc
css = re.sub(r'\/\* ===== HEADER ===== \*\/(.*?)\/\* ===== MAIN 3-COLUMN LAYOUT ===== \*\/', """/* ===== HEADER ===== */
.app-header {
    height: var(--header-height);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    flex-shrink: 0;
}

.header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    flex: 1;
}

.logo-icon {
    width: 28px;
    height: 28px;
    color: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
}

.header-titles h1 {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    line-height: 1.2;
}

.header-titles .subtitle {
    font-size: 11px;
    color: var(--color-text-muted);
}

.header-center {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex: 1;
}

.algo-badge {
    background: var(--color-accent-light);
    color: var(--color-accent-text);
    font-size: 12px;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 600;
}

.sim-status {
    display: flex;
    align-items: center;
    gap: 6px;
}

.status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--color-text-muted); /* default idle */
}

.status-dot.running { background: var(--color-success); }
.status-dot.paused { background: var(--color-warning); }
.status-dot.completed { background: var(--color-accent); }

.status-text {
    font-size: 13px;
    font-weight: 500;
}

.time-box {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 600;
    color: var(--color-accent-text);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 2px 8px;
}

.header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--spacing-md);
    flex: 1;
}

.process-count {
    background: var(--color-surface-alt);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-secondary);
}

.shortcut-hint {
    font-size: 11px;
    color: var(--color-text-muted);
}

""", css, flags=re.DOTALL)

css = re.sub(r'\/\* ===== MAIN 3-COLUMN LAYOUT ===== \*\/(.*?)\/\* ===== CARD COMPONENT ===== \*\/', """/* ===== MAIN 3-COLUMN LAYOUT ===== */
.main-content {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
}

.left-panel {
    border-right: 1px solid var(--color-border);
    background: var(--color-surface);
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    width: var(--sidebar-left-width);
}

.center-panel {
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    flex: 1;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    min-width: 0;
    background: var(--color-bg);
}

.right-panel {
    border-left: 1px solid var(--color-border);
    background: var(--color-surface);
    padding: 12px; /* Set to 12px to conserve space */
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    width: var(--sidebar-right-width);
}

.right-panel * {
    box-sizing: border-box;
}

.resize-handle {
    width: 4px;
    cursor: col-resize;
    background: transparent;
    flex-shrink: 0;
    transition: background 0.15s;
}

.resize-handle:hover {
    background: var(--color-accent);
}

""", css, flags=re.DOTALL)

# 5. Fix card corners
css = re.sub(r'\.card \{\n    background', '.card {\n    background', css)
css = re.sub(r'border-radius: var\(--radius-lg\);', 'border-radius: 10px;', css)

# 6. Primary buttons
css = re.sub(r'\.btn-primary \{.*?\}', '.btn-primary {\n    background: var(--color-accent);\n    color: #FFFFFF;\n    border-color: var(--color-accent);\n    border-radius: 8px;\n}', css, flags=re.DOTALL)
css = re.sub(r'\.btn-primary:hover:not\(:disabled\) \{.*?\}', '.btn-primary:hover:not(:disabled) {\n    background: var(--color-accent-hover);\n    border-color: var(--color-accent-hover);\n}', css, flags=re.DOTALL)

css = re.sub(r'\.btn-success \{.*?\}', '.btn-success {\n    background: var(--color-success);\n    color: #FFFFFF;\n    border-color: var(--color-success);\n    border-radius: 8px;\n}', css, flags=re.DOTALL)
css = re.sub(r'\.btn-success:hover:not\(:disabled\) \{.*?\}', '.btn-success:hover:not(:disabled) {\n    background: #047857;\n    border-color: #047857;\n}', css, flags=re.DOTALL)

css = re.sub(r'\.btn-danger \{.*?\}', '.btn-danger {\n    background: transparent;\n    border-color: var(--color-danger);\n    color: var(--color-danger);\n    border-radius: 8px;\n}', css, flags=re.DOTALL)

# 7. Section heading accent bar & table headers
css = re.sub(r'\.section-title \{.*?border-left: 3px solid var\(--color-primary\).*?\}', '.section-title {\n    font-size: 0.75rem;\n    font-weight: 600;\n    color: var(--color-text-secondary);\n    text-transform: uppercase;\n    letter-spacing: 0.05em;\n    margin-bottom: var(--spacing-md);\n    padding-left: var(--spacing-sm);\n    border-left: 3px solid var(--color-accent);\n}', css, flags=re.DOTALL)

# Update table header
css = re.sub(r'\.data-table th \{.*?\}', '.data-table th {\n    background: var(--color-bg-surface);\n    font-size: 11px;\n    text-transform: uppercase;\n    letter-spacing: 0.05em;\n    color: var(--color-text-secondary);\n    font-weight: 600;\n    padding: 10px 12px;\n    border-bottom: 1px solid var(--color-border);\n    white-space: nowrap;\n    position: sticky;\n    top: 0;\n}', css, flags=re.DOTALL)

# Update metric cards
css = re.sub(r'\.metric-value \{.*?\}', '.metric-value {\n    font-size: 22px;\n    font-weight: 600;\n    color: var(--color-accent-text);\n    font-family: var(--font-mono);\n    margin-bottom: 2px;\n    line-height: 1.2;\n}', css, flags=re.DOTALL)
css = re.sub(r'\.metric-label \{.*?\}', '.metric-label {\n    font-size: 11px;\n    color: var(--color-text-muted);\n    text-transform: uppercase;\n    letter-spacing: 0.06em;\n    font-weight: 500;\n}', css, flags=re.DOTALL)


# Update comparison table
css = re.sub(r'\.comparison-table \{\s*(.*?)\s*\}', '.comparison-table {\n    width: 100%;\n    table-layout: fixed;\n}', css, flags=re.DOTALL)
css = re.sub(r'\.data-table \{\s*(.*?)\s*\}', '.data-table {\n    width: 100%;\n    border-collapse: collapse;\n    text-align: left;\n    font-size: 0.82rem;\n}', css, flags=re.DOTALL)
css = re.sub(r'\.data-table td \{.*\}', '.data-table td {\n    padding: 10px 12px;\n    border-bottom: 1px solid var(--color-border);\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n}', css)

with open('css/style.css', 'w') as f:
    f.write(css)

print("CSS updated")
