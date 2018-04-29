$('#resort-search').on('input', function() {
  var search = $(this).serialize();
  if(search === "search=") {
    search = "all"
  }
  // shows only the cards of the resorts we want to see
  $.get('/resorts?' + search, function(data) {
    $('#resort-grid').html('');
    data.forEach(function(resort) {
      $('#resort-grid').append(`
        <div class="col-lg-3 col-md-6 col-sm-12">
          <div class="card hvr-shrink" style="width: 18rem;">
            <img class="card-img-top" src="${ resort.image }" alt="Card image cap">
              <div class="card-body">
                <h5 class="card-title">${ resort.name }</h5>
                <hr>
                <a class="btn btn-primary btn-lg round hvr-push" 
                  data-toggle="collapse" href="/resorts/${ resort._id }" role="button" aria-expanded="false" aria-controls="collapseExample">
                  Details
                </a>
              </div>
          </div>
      </div>
      `);
    });
  });
});

$('#resort-search').submit(function(event) {
  event.preventDefault();
});