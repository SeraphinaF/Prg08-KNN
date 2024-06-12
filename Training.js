 fetch('captured_poses_all.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('There was an error fetching the data');
      }
      return response.json();
    })
    .then(jsonData => {
      nn = ml5.neuralNetwork({ task: 'classification', debug: true });

      jsonData.forEach(data => {
        nn.addData(data.landmarks, { label: data.label });
      });

      nn.normalizeData();

      nn.train({ epochs: 100 }, () => {
        console.log('Training finished!');
        
        // Save the trained model
        nn.save();
      });
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
