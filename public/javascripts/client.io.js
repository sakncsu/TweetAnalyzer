//setup the client browser to connect to the server running at port 3000
var server_name = "http://127.0.0.1:3000/";
var server = io.connect(server_name);
console.log('Client: Connecting to server '+server_name);

//receive emitted tweet info from the server and callback to handle it
server.on('tweet_info', function(data) {

//tweet_list variable will capture the list-group(love or hate) in the index.jade file and by default hate list
var tweet_list = $('#tweet_list_hate');

	//if it is love tweet we need to add it to the love list-group
	if(data.is_love)
	{
		 tweet_list = $('#tweet_list_love');
	}

	//Add the li element at the top of a list-group with tweet, user-name and thumbnail
	tweet_list.prepend('<li class="list-group-item success">'
	+'<img class="img-circle" width=40 height=40 src='+data.image+'/>'
	+'<h4 class="list-group-item-heading"><strong>'+data.name+'</strong></h4>'
	+'<p class="list-group-item-text">'+data.tweet+'</p>'
	+'</li>');

	//List displays 10 tweets, so remove if length of list greater than 10
	if(tweet_list.children().length > 10 ) {
			tweet_list.children().last().remove();
	}

	//update the count of love and hate tweets along with total count
	$('#table_values td').eq(0).html(data.love_count);
	$('#table_values td').eq(1).html(data.hate_count);
	$('#table_values td').eq(2).html(data.love_count+data.hate_count);

	//progress bar to display the love and hate percentage. Green bar shows love percentage 
	// and red bar shows hate percentage
	$('#love_bar').css('width', data.love_percent);
	span = document.getElementById("text_love");
	txt = document.createTextNode(data.love_percent);
	span.innerText = txt.textContent;

	$('#hate_bar').css('width', data.hate_percent);
	span = document.getElementById("text_hate");
	txt = document.createTextNode(data.hate_percent);
	span.innerText = txt.textContent;

	//Final verdict depending on number of tweets
	if(data.hate_count>data.love_count)
		{
			$("#verdict").html( "<strong>World is filled with Hate!</strong>" );
		}
});


