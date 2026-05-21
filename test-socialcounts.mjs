/**
 * Script de teste para validar migração para SocialCounts
 * Run: node test-socialcounts.mjs
 */

import { resolveChannel, getChannelById, parseChannelInput } from './server/src/socialcounts.js';

async function testParseInput() {
  console.log('🧪 Testando parseChannelInput...\n');

  const tests = [
    'https://youtube.com/@MrBeast',
    'https://youtube.com/channel/UCX6OQ9DkcsbYNE6H8uQQuVA',
    'UCX6OQ9DkcsbYNE6H8uQQuVA',
    '@MrBeast',
    'MrBeast',
  ];

  for (const test of tests) {
    try {
      const result = parseChannelInput(test);
      console.log(`✅ "${test}"`);
      console.log(`   → strategy: ${result.strategy}, value: ${result.value}\n`);
    } catch (err) {
      console.log(`❌ "${test}": ${err.message}\n`);
    }
  }
}

async function testGetChannelById() {
  console.log('🧪 Testando getChannelById com ID real...\n');

  try {
    console.log('Buscando MrBeast (UCX6OQ9DkcsbYNE6H8uQQuVA)...');
    const channel = await getChannelById('UCX6OQ9DkcsbYNE6H8uQQuVA');
    console.log('✅ Sucesso!');
    console.log(`   ID: ${channel.id}`);
    console.log(`   Title: ${channel.title}`);
    console.log(`   Subscribers: ${channel.subscriberCount.toLocaleString('pt-BR')}`);
    console.log(`   Precise: ${channel.subscriberCountPrecise}`);
    console.log(`   Source: ${channel.subscriberCountSource}\n`);
  } catch (err) {
    console.log(`❌ Erro: ${err.message}\n`);
  }
}

async function testResolveChannel() {
  console.log('🧪 Testando resolveChannel...\n');

  try {
    console.log('Resolvendo ID "UCX6OQ9DkcsbYNE6H8uQQuVA"...');
    const channel = await resolveChannel('UCX6OQ9DkcsbYNE6H8uQQuVA');
    console.log('✅ Sucesso!');
    console.log(`   Channel: ${channel.title}`);
    console.log(`   Subscribers: ${channel.subscriberCount.toLocaleString('pt-BR')}\n`);
  } catch (err) {
    console.log(`❌ Erro: ${err.message}\n`);
  }

  try {
    console.log('Tentando resolver handle "@MrBeast" (deve falhar sem busca)...');
    await resolveChannel('@MrBeast');
  } catch (err) {
    console.log(`⚠️  Esperado: ${err.message}\n`);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════\n');
  console.log('  UtiliKit - Teste SocialCounts API\n');
  console.log('═══════════════════════════════════════════════════\n');

  await testParseInput();
  await testGetChannelById();
  await testResolveChannel();

  console.log('═══════════════════════════════════════════════════');
  console.log('✅ Testes concluídos!');
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
