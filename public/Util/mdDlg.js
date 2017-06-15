app.factory('mdDlg', function($mdDialog) {
   return {
      login: function(scp, content, header, btns, ez) {
         var loginDlg = $mdDialog.confirm()
          .title(header)
          .content(content)
          .ariaLabel('Yes')
          .ok(btns[0])
          .cancel(btns[1]);
         
         return $mdDialog.show(loginDlg);
      }
   }
});

/* 
// Declare a service that allows an error message.
app.factory('mdDlg', ['$mdDialog', function(mdDlg) {
   return {
      show: function(scp, msg, header, btns, sz) {
         scp.msg = msg;
         scp.hdr = header;
         scp.buttons = btns || ['OK'];
         
         return uibM.open({
            templateUrl: 'Util/mdDlg.template.html',
            scope: scp,
            size: sz || 'sm'
         }).result;
      }
   };
}]);*/
