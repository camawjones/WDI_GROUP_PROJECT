angular
  .module('charityApp')
  .controller('shopShowController', shopShowController);

shopShowController.$inject = ['Shop','$stateParams', '$state'];
function shopShowController(Shop, $stateParams, $state){
  const vm = this;
  vm.shop = Shop.get($stateParams);
  console.log($state);

  vm.delete = () => {

    Shop
      .remove({id: vm.shop._id})
      .$promise
      .then(()=> {
        $state.go('shopsIndex');
      });
    console.log( 'deleted');
  };

}
