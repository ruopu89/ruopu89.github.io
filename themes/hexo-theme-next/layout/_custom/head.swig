{#
EasyEnglish word-glossary enhancement: load its CSS + JS on every page.
glossary.js is a no-op on pages without a "单词" section (normal blog posts).
#}
<link rel="stylesheet" href="{{ theme.root }}easyenglish/glossary.css">
<script src="{{ theme.root }}easyenglish/glossary.js" defer></script>
