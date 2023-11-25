function addToCart(proId) {                              //Doing ajax for add to cart (reload only add to cart part) 
    $.ajax({
      url: '/add-to-cart/' + proId,
      method: 'get',
      success: (response) => {
        if(response.status){
            let count=$('#cart-count').html()
            count=parseInt(count)+1
            $('#cart-count').html(count)
        }
        alert(response);
        // You can update the UI or perform additional actions based on the server's response
      },
      error: (error) => {
        console.error(error);
        alert('Error adding to cart');
      }
    });
  }
  