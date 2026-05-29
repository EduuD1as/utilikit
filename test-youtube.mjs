async function testRapidApi() {
  try {
    console.log('Testing RapidAPI YouTube API...');
    const response = await fetch('https://yt-api.p.rapidapi.com/channel/info?id=@MrBeast', {
      headers: {
        'X-RapidAPI-Key': 'demo',
        'X-RapidAPI-Host': 'yt-api.p.rapidapi.com'
      }
    });
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRapidApi();
