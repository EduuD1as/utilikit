/**
 * Script de teste completo - youtube-resolver.js
 * Testa busca por nome, handle e URLs
 * Run: node test-resolver.mjs
 */

import { resolveUserInput } from './server/src/youtube-resolver.js';

async function testResolveUserInput() {
  console.log('🧪 Testando resolveUserInput (parsing + resolução)\n');

  const tests = [
    // Formato: [input, shouldFail?, description]
    ['MrBeast', false, 'Nome puro'],
    ['@MrBeast', false, 'Handle com @'],
    ['https://www.youtube.com/@MrBeast', false, 'URL com @handle'],
    ['UCX6OQ9DkcsbYNE6H8uQQuVA', false, 'ID puro (sem scraping)'],
    ['https://www.youtube.com/channel/UCX6OQ9DkcsbYNE6H8uQQuVA', false, 'URL com ID'],
    ['https://youtube.com/c/MrBeast', false, 'URL legada /c/'],
    ['', true, 'Entrada vazia (deve falhar)'],
  ];

  let passed = 0;
  let failed = 0;

  for (const [input, shouldFail, description] of tests) {
    process.stdout.write(`Testing: ${description.padEnd(30)} "${input}".`);

    try {
      const channelId = await resolveUserInput(input);
      
      if (shouldFail) {
        console.log(` ❌ FALHOU (deveria ter lançado erro)`);
        failed++;
      } else {
        console.log(` ✅`);
        console.log(`   → Channel ID: ${channelId}`);
        passed++;
      }
    } catch (err) {
      if (shouldFail) {
        console.log(` ✅ (erro esperado)`);
        passed++;
      } else {
        console.log(` ❌`);
        console.log(`   → Erro: ${err.message}`);
        failed++;
      }
    }
  }

  console.log('\n═════════════════════════════════════════════════');
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`📊 Taxa: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('═════════════════════════════════════════════════\n');

  return failed === 0;
}

async function main() {
  console.log('═════════════════════════════════════════════════\n');
  console.log('  UtiliKit - Teste Resolver de Canais\n');
  console.log('═════════════════════════════════════════════════\n');

  const allPassed = await testResolveUserInput();

  if (allPassed) {
    console.log('🎉 Todos os testes passaram!');
    process.exit(0);
  } else {
    console.log('⚠️  Alguns testes falharam!');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
