// Declare a service that allows an error message.
app.factory('notifyDlg', ['$uibModal', function(uibM) {
   return {
      show: function(scp, msg, header, btns, sz) {
         scp.msg = msg;
         scp.hdr = header;
         scp.buttons = btns || ['OK'];
         
         return uibM.open({
            templateUrl: 'Util/notifyDlg.template.html',
            scope: scp,
            size: sz || 'sm'
         }).result;
      }
   };
}]);
